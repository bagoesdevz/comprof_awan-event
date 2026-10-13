import "server-only";
import {createHash,timingSafeEqual} from "node:crypto";
import {HttpError} from "./http";
import {record,findEvent,commit} from "./platform";
import {getServiceSupabaseClient} from "@/lib/supabase/server";
import {z} from "zod";
import {readBytes} from "./http";
import type {Registration,ManagedEvent} from "@/lib/platform-model";
import {providerPaymentStatus,canChangePayment} from "@/lib/payment-state";
export function paymentConfig(){
 const key=process.env.MIDTRANS_SERVER_KEY;if(!key)throw new HttpError(503,"Pembayaran belum tersedia. Silakan hubungi penyelenggara.");
 const mode=process.env.MIDTRANS_IS_PRODUCTION;
 if(mode!=="true"&&mode!=="false")throw new HttpError(503,"Mode pembayaran belum dikonfigurasi.");
 const production=mode==="true";
 if(production&&key.startsWith("SB-"))throw new HttpError(503,"Pembayaran production belum dikonfigurasi.");
 return {key,snap:production?"https://app.midtrans.com":"https://app.sandbox.midtrans.com",api:production?"https://api.midtrans.com":"https://api.sandbox.midtrans.com"};
}
export async function midtrans(path:string,body?:unknown){
 const cfg=paymentConfig();
 try{
  const response=await fetch((body?cfg.snap:cfg.api)+path,{method:body?"POST":"GET",headers:{"Content-Type":"application/json",Authorization:"Basic "+Buffer.from(cfg.key+":").toString("base64")},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000),cache:"no-store"});
  if(!response.ok)throw new HttpError(502,"Status pembayaran belum dapat diperiksa. Coba lagi.");
  return z.record(z.string(),z.unknown()).parse(JSON.parse((await readBytes(response,100000)).toString("utf8")));
 }catch{throw new HttpError(502,"Layanan pembayaran belum dapat dihubungi. Coba lagi.");}
}
export function verifySignature(input:{order_id:string;status_code:string;gross_amount:string;signature_key:string}){
 const expected=createHash("sha512").update(input.order_id+input.status_code+input.gross_amount+paymentConfig().key).digest("hex");
 if(!/^[a-f0-9]{128}$/i.test(input.signature_key)||!timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(input.signature_key,"hex")))throw new HttpError(401,"Tanda tangan tidak valid.");
}
export async function reconcilePayment(orderId:string){
 const rr=await record("registrations",orderId);if(!rr)throw new HttpError(404,"Pendaftaran tidak ditemukan.");
 const registration=rr.data as unknown as Registration;
 if(registration.orderId){await reconcilePayment(registration.orderId);return (await record("registrations",orderId))!.data as unknown as Registration;}
 if(registration.amount===0)return registration;
 const payment=z.object({order_id:z.string(),gross_amount:z.string().regex(/^\d+(\.\d{1,2})?$/),currency:z.string().optional(),transaction_status:z.string().max(50),fraud_status:z.string().optional(),payment_type:z.string().max(100).optional()}).parse(await midtrans("/v2/"+encodeURIComponent(orderId)+"/status"));
 if(Number(payment.gross_amount)!==registration.amount||payment.order_id!==registration.id||(payment.currency&&payment.currency!=="IDR"))throw new HttpError(409,"Jumlah pembayaran tidak sesuai.");
 const status=payment.transaction_status;
 const next=providerPaymentStatus(status,payment.fraud_status);
 if(!next)throw new HttpError(409,"Status pembayaran memerlukan pemeriksaan penyelenggara.");
 if(next==="paid"&&["expired","cancelled"].includes(registration.payment))throw new HttpError(409,"Pembayaran diterima setelah tiket ditutup. Hubungi penyelenggara untuk memeriksa alokasi kursi.");
 if(!canChangePayment(registration.payment,next))return registration;
 const oldPayment=registration.payment;
 registration.payment=next;registration.method=String(payment.payment_type||"Midtrans");
 if(next==="paid")registration.paidAt=new Date().toISOString();
 if(next==="refunded"){
  registration.refund=registration.amount;
  if(registration.certificate)registration.certificate.status="revoked";
 }
 const changes: Array<{collection:"registrations"|"events";id:string;revision:number;data:Record<string,unknown>;owner_email?:string|null;published?:boolean}>=[
  {collection:"registrations",id:rr.id,revision:rr.revision,data:registration as unknown as Record<string,unknown>,owner_email:rr.owner_email}
 ];
 const {data:members,error:memberError}=await getServiceSupabaseClient().from("platform_records").select("*").eq("collection","registrations").eq("data->>orderId",registration.id);
 if(memberError)throw new HttpError(503,"Status peserta grup belum dapat diperbarui.");
 for(const member of members||[]){
  const enrollment=member.data as unknown as Registration;
  enrollment.payment=next;
  if(next==="paid")enrollment.paidAt=registration.paidAt;
  if(next==="refunded"&&enrollment.certificate)enrollment.certificate.status="revoked";
  changes.push({collection:"registrations",id:member.id,revision:member.revision,data:enrollment as unknown as Record<string,unknown>,owner_email:member.owner_email});
 }
 if(["expired","cancelled","refunded"].includes(next)&&!["expired","cancelled","refunded"].includes(oldPayment)){
   const er=await findEvent(registration.eventSlug);
   if(er){
    const ev=er.data as unknown as ManagedEvent;
    const tk=ev.tickets.find(t=>t.id===registration.ticketId);
    if(tk){
     tk.quotaLeft=Math.min(tk.quota,tk.quotaLeft+registration.quantity);
     ev.quotaLeft=ev.tickets.reduce((n,t)=>n+t.quotaLeft,0);
     changes.push({collection:"events",id:er.id,revision:er.revision,data:ev as unknown as Record<string,unknown>,published:er.published});
    }
   }
 }
 await commit(changes);
 return registration;
}

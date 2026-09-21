import "server-only";
import {createHash,timingSafeEqual} from "node:crypto";
import {HttpError} from "./http";
import {record,findEvent,commit} from "./platform";
import type {Registration,ManagedEvent} from "@/lib/platform-model";
export function paymentConfig(){
 const key=process.env.MIDTRANS_SERVER_KEY;if(!key)throw new HttpError(503,"Pembayaran belum tersedia. Silakan hubungi penyelenggara.");
 const production=process.env.MIDTRANS_IS_PRODUCTION==="true";
 return {key,snap:production?"https://app.midtrans.com":"https://app.sandbox.midtrans.com",api:production?"https://api.midtrans.com":"https://api.sandbox.midtrans.com"};
}
export async function midtrans(path:string,body?:unknown){
 const cfg=paymentConfig();const r=await fetch((body?cfg.snap:cfg.api)+path,{method:body?"POST":"GET",headers:{"Content-Type":"application/json",Authorization:"Basic "+Buffer.from(cfg.key+":").toString("base64")},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000),cache:"no-store"});
 const data=await r.json();if(!r.ok)throw new HttpError(502,"Status pembayaran belum dapat diperiksa. Coba lagi.");
 return data;
}
export function verifySignature(input:{order_id:string;status_code:string;gross_amount:string;signature_key:string}){
 const expected=createHash("sha512").update(input.order_id+input.status_code+input.gross_amount+paymentConfig().key).digest("hex");
 if(!/^[a-f0-9]{128}$/i.test(input.signature_key)||!timingSafeEqual(Buffer.from(expected),Buffer.from(input.signature_key)))throw new HttpError(401,"Tanda tangan tidak valid.");
}
export async function reconcilePayment(orderId:string){
 const rr=await record("registrations",orderId);if(!rr)throw new HttpError(404,"Pendaftaran tidak ditemukan.");
 const registration=rr.data as unknown as Registration;
 if(registration.amount===0)return registration;
 const payment=await midtrans("/v2/"+encodeURIComponent(orderId)+"/status");
 if(Number(payment.gross_amount)!==registration.amount||payment.order_id!==registration.id)throw new HttpError(409,"Jumlah pembayaran tidak sesuai.");
 const status=payment.transaction_status;
 const paid=status==="settlement"||(status==="capture"&&payment.fraud_status==="accept");
 const next=paid?"paid":status==="deny"?"failed":status==="expire"?"expired":status==="cancel"?"cancelled":status==="refund"?"refunded":"pending";
 // Do not regress a confirmed settlement on a delayed notification.
 if(registration.payment==="paid"&&next!=="refunded")return registration;
 if(registration.payment===next)return registration;
 const oldPayment=registration.payment;
 registration.payment=next;registration.method=String(payment.payment_type||"Midtrans");
 if(paid)registration.paidAt=new Date().toISOString();
 if(next==="refunded")registration.refund=registration.amount;
 const changes: Array<{collection:"registrations"|"events";id:string;revision:number;data:Record<string,unknown>;owner_email?:string|null;published?:boolean}>=[
  {collection:"registrations",id:rr.id,revision:rr.revision,data:registration as unknown as Record<string,unknown>,owner_email:rr.owner_email}
 ];
 if(["expired","cancelled","refunded"].includes(next)&&!["expired","cancelled","refunded"].includes(oldPayment)){
  try{
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
  }catch{}
 }
 await commit(changes);
 return registration;
}

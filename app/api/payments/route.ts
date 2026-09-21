import {z} from "zod";
import {currentUser} from "@/lib/supabase/auth";
import {requireUser,record,commit,findEvent} from "@/lib/server/platform";
import {midtrans,paymentConfig,reconcilePayment} from "@/lib/server/payments";
import {sameOrigin,readBody,fail,json,rateLimit,HttpError} from "@/lib/server/http";
const schema=z.object({registrationReference:z.string().regex(/^AWN-[A-Z0-9]{10,32}$/)});
export async function POST(request:Request){try{
 sameOrigin(request);const user=requireUser(await currentUser());await rateLimit("payment:"+user.id,10);
 const input=schema.parse(await readBody(request,5000)),rr=await record("registrations",input.registrationReference);
 if(!rr||rr.owner_email!==user.email.toLowerCase())throw new HttpError(404,"Pendaftaran tidak ditemukan.");
 const r=rr.data;if(r.payment!=="pending")throw new HttpError(409,"Transaksi tidak menunggu pembayaran.");
 const existing=await record("payment_sessions",rr.id);if(existing?.data.url)return json({data:{paymentUrl:existing.data.url}});
 const event=await findEvent(String(r.eventSlug));
 const result=await midtrans("/snap/v1/transactions",{transaction_details:{order_id:rr.id,gross_amount:r.amount},item_details:[{id:r.ticketId,price:Number(r.amount)/Number(r.quantity),quantity:r.quantity,name:String(event.data.title).slice(0,50)}],customer_details:{first_name:r.name,email:r.email,phone:r.phone},expiry:{unit:"hours",duration:24}});
 const url=new URL(result.redirect_url);if(url.origin!==paymentConfig().snap)throw new HttpError(502,"Tautan pembayaran tidak valid.");
 await commit([{collection:"payment_sessions",id:rr.id,revision:0,owner_email:rr.owner_email,data:{url:url.href}}]);
 return json({data:{paymentUrl:url.href}});
 }catch(e){return fail(e)}}
export async function GET(request:Request){try{
 const user=requireUser(await currentUser());await rateLimit("payment-status:"+user.id,30);const id=new URL(request.url).searchParams.get("registration")||"";
 const rr=await record("registrations",id);if(!rr||rr.owner_email!==user.email.toLowerCase())throw new HttpError(404,"Transaksi tidak ditemukan.");
 return json({data:await reconcilePayment(id)});
 }catch(e){return fail(e)}}

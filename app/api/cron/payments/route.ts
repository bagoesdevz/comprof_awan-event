import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { requireCron } from "@/lib/server/cron-auth";
import { expireUnstartedRegistration } from "@/lib/server/payment-expiry";
import { reconcilePayment } from "@/lib/server/payments";
import { fail,json,HttpError } from "@/lib/server/http";

export const dynamic="force-dynamic";
export const maxDuration=60;
export async function GET(request:Request){try{
 requireCron(request);const started=Date.now();
 const {data,error}=await getServiceSupabaseClient().rpc("platform_pending_payments",{p_limit:25});
 if(error)throw new HttpError(503,"Pesanan belum dapat diperiksa.");
 let expired=0,reconciled=0;const failures:string[]=[];
 for(const row of data||[]){
  if(Date.now()-started>40000)break;
  try{
   const checked=await getServiceSupabaseClient().rpc("platform_mark_payment_checked",{p_id:row.registration_id});
   if(checked.error)throw new HttpError(503,"Jadwal pemeriksaan pesanan belum dapat disimpan.");
   if(await expireUnstartedRegistration(row.registration_id))expired++;else {await reconcilePayment(row.registration_id);reconciled++;}
  }
  catch{failures.push(row.registration_id);}
 }
 return json({data:{expired,reconciled,failures}},failures.length?207:200);
}catch(error){return fail(error)}}

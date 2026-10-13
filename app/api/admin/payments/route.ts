import { z } from "zod";
import { currentUser } from "@/lib/supabase/auth";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/server/platform";
import { fail,json } from "@/lib/server/http";
import type { Registration } from "@/lib/platform-model";
export const dynamic="force-dynamic";
const filters=z.object({page:z.coerce.number().int().min(1).max(100000).default(1),limit:z.coerce.number().int().min(1).max(100).default(20),status:z.enum(["all","pending","paid","failed","expired","cancelled","refunded"]).default("all")});
export async function GET(request:Request){try{
 requireAdmin(await currentUser());
 const {page,limit,status}=filters.parse(Object.fromEntries(new URL(request.url).searchParams));
 let query=getServiceSupabaseClient().from("platform_records").select("data",{count:"exact"}).eq("collection","registrations").order("data->>createdAt",{ascending:false}).range((page-1)*limit,page*limit-1);
 if(status!=="all")query=query.eq("data->>payment",status);
 const {data,error,count}=await query;if(error)throw new Error("Payment query failed");
 return json({data:(data||[]).map(row=>{const r=row.data as unknown as Registration;return {id:r.id,transactionId:r.id,registrationReference:r.id,participantName:r.name,participantEmail:r.email,eventSlug:r.eventSlug,amount:r.amount,paymentMethod:r.method||null,status:r.payment,paidAt:r.paidAt||null,createdAt:r.createdAt}}),meta:{page,limit,total:count||0,totalPages:Math.ceil((count||0)/limit)}});
}catch(error){return fail(error)}}

import { z } from "zod";
import { currentUser } from "@/lib/supabase/auth";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/server/platform";
import { fail,json } from "@/lib/server/http";
import type { Registration } from "@/lib/platform-model";
export const dynamic="force-dynamic";
const filters=z.object({page:z.coerce.number().int().min(1).max(100000).default(1),limit:z.coerce.number().int().min(1).max(100).default(20),status:z.enum(["all","valid","revoked"]).default("all"),emailStatus:z.enum(["all","pending","sent"]).default("all")});
export async function GET(request:Request){try{
 requireAdmin(await currentUser());
 const {page,limit,status,emailStatus}=filters.parse(Object.fromEntries(new URL(request.url).searchParams));
 let query=getServiceSupabaseClient().from("platform_records").select("data",{count:"exact"}).eq("collection","registrations").not("data->certificate","is",null).order("data->certificate->>issuedAt",{ascending:false}).range((page-1)*limit,page*limit-1);
 if(status!=="all")query=query.eq("data->certificate->>status",status);
 if(emailStatus==="sent")query=query.not("data->certificate->>emailSentAt","is",null);
 if(emailStatus==="pending")query=query.is("data->certificate->>emailSentAt",null);
 const {data,error,count}=await query;if(error)throw new Error("Certificate query failed");
 return json({data:(data||[]).map(row=>{const r=row.data as unknown as Registration,c=r.certificate!;return {id:r.id,certificateNumber:c.number,registrationReference:r.id,participantName:r.name,participantEmail:r.email,eventSlug:r.eventSlug,status:c.status,emailStatus:c.emailSentAt?"sent":"pending",emailSentAt:c.emailSentAt||null,emailMessageId:c.emailMessageId||null,downloadCount:c.downloadCount||0,lastDownloadedAt:c.lastDownloadedAt||null,issuedAt:c.issuedAt}}),meta:{page,limit,total:count||0,totalPages:Math.ceil((count||0)/limit)}});
}catch(error){return fail(error)}}

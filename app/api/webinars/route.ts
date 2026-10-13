import { z } from "zod";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { publicEventData } from "@/lib/server/public-events";
import { fail,json } from "@/lib/server/http";
import type { ManagedEvent } from "@/lib/platform-model";
export const dynamic="force-dynamic";
const filters=z.object({limit:z.coerce.number().int().min(1).max(50).default(12),category:z.string().max(100).optional(),type:z.enum(["ONLINE","ONSITE","HYBRID"]).optional()});
export async function GET(request:Request){try{
 const input=filters.parse(Object.fromEntries(new URL(request.url).searchParams));
 let query=getServiceSupabaseClient().from("platform_records").select("data",{count:"exact"}).eq("collection","events").eq("published",true).order("data->>startAt").limit(input.limit);
 if(input.category)query=query.eq("data->>category",input.category);
 if(input.type)query=query.eq("data->>type",input.type);
 const {data,error,count}=await query;if(error)throw new Error("Event query failed");
 return json({data:(data||[]).map(row=>publicEventData(row.data as unknown as ManagedEvent)),meta:{count:count||0,limit:input.limit}});
}catch(error){return fail(error)}}

import { z } from "zod";
import { findEvent } from "@/lib/server/platform";
import { publicEventData } from "@/lib/server/public-events";
import { fail,json,HttpError } from "@/lib/server/http";
import type { ManagedEvent } from "@/lib/platform-model";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){try{
 const {slug}=await params;z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).parse(slug);
 const event=await findEvent(slug);if(!event.published)throw new HttpError(404,"Event tidak ditemukan.");
 return json({data:publicEventData(event.data as unknown as ManagedEvent)});
}catch(error){return fail(error)}}

import {z} from "zod";
import {createHash} from "node:crypto";
import {commit,findEvent,records} from "@/lib/server/platform";
import {sameOrigin,readBody,fail,json,rateLimit,HttpError} from "@/lib/server/http";
const schema=z.object({kind:z.enum(["contact","program","waitlist"]),name:z.string().trim().min(2).max(160),email:z.string().email().max(254),phone:z.string().regex(/^\+?[0-9\s()-]{8,20}$/),institution:z.string().max(160).default(""),message:z.string().trim().min(2).max(3000),eventSlug:z.string().max(120).optional(),website:z.string().max(100).default("")});
export async function POST(request:Request){try{
 sameOrigin(request);const input=schema.parse(await readBody(request,15000));if(input.website)return json({ok:true});
 const email=input.email.toLowerCase();const hash=createHash("sha256").update(email).digest("hex");await rateLimit("inquiry:"+hash,3,3600);
 const id=crypto.randomUUID();
 if(input.kind==="waitlist"){
  const er=await findEvent(input.eventSlug||"");if(!er.published||!er.data.waitlist)throw new HttpError(409,"Daftar tunggu tidak tersedia.");
  const rows=await records("waitlist");const eventRows=rows.filter(r=>r.data.eventSlug===input.eventSlug);
  if(eventRows.some(r=>r.owner_email===email))throw new HttpError(409,"Email sudah masuk daftar tunggu.");
  await commit([{collection:"waitlist",id,revision:0,owner_email:email,data:{id,name:input.name,email,phone:input.phone,eventSlug:input.eventSlug,ticketId:input.message,position:eventRows.length+1,joinedAt:new Date().toISOString(),status:"waiting"}}]);
 }else await commit([{collection:"leads",id,revision:0,data:{id,name:input.name,email,phone:input.phone,institution:input.institution,kind:input.kind,message:input.message,status:"New",pic:"",followUp:"",notes:"",history:[new Date().toISOString()+" Pengajuan diterima"]}}]);
 return json({ok:true},201);
 }catch(e){return fail(e)}}

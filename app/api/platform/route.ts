import { z } from "zod";
import { currentUser } from "@/lib/supabase/auth";
import { collections } from "@/lib/platform-records";
import { snapshot,record,commit,requireUser,requireAdmin,roleOf } from "@/lib/server/platform";
import { sameOrigin,readBody,fail,json,rateLimit,HttpError } from "@/lib/server/http";
import { eventSchema,profileSchema,contentSchema,articleSchema,leadSchema,templateSchema,campaignSchema } from "@/lib/server/validation";
export const dynamic="force-dynamic";
export async function GET(){try{return json(await snapshot(await currentUser()));}catch(error){return fail(error)}}
const payload=z.object({changes:z.array(z.object({collection:z.enum(collections),id:z.string().min(1).max(254),revision:z.number().int().min(0),data:z.record(z.string(),z.unknown())})).min(1).max(100)});
export async function PATCH(request:Request){
 try{sameOrigin(request);const user=requireUser(await currentUser());await rateLimit("write:"+user.id);const input=payload.parse(await readBody(request));
 const changes=[];
 for(const change of input.changes){
  const old=await record(change.collection,change.id);let data:Record<string,unknown>;let owner_email:string|null=null,published=false;
  if(old&&old.revision!==change.revision)throw new HttpError(409,"Data sudah berubah. Muat ulang sebelum menyimpan.");
  if(change.collection==="profiles"){
   if(change.id!==user.email.toLowerCase())throw new HttpError(403,"Profil tidak diizinkan.");
   data=profileSchema.parse(change.data);data.email=user.email.toLowerCase();owner_email=user.email.toLowerCase();
  }else if(change.collection==="notices"){
   if(!old||old.owner_email!==user.email.toLowerCase())throw new HttpError(403,"Notifikasi tidak diizinkan.");
   data={...old.data,read:change.data.read===true};owner_email=old.owner_email;
  }else{
   requireAdmin(user,["cms","articles","templates","campaigns"].includes(change.collection));
   const schemas={events:eventSchema,cms:contentSchema,articles:articleSchema,leads:leadSchema,templates:templateSchema,campaigns:campaignSchema};
   if(!(change.collection in schemas))throw new HttpError(403,"Perubahan ini memerlukan tindakan khusus.");
   data=schemas[change.collection as keyof typeof schemas].parse(change.data);
   if(change.collection!=="cms"&&data.id!==change.id)throw new HttpError(422,"ID tidak cocok.");
   if(change.collection==="events"&&old){
    if(data.slug!==old.data.slug)throw new HttpError(422,"Slug event yang tersimpan tidak dapat diubah.");
    const before=old.data.tickets as Array<{id:string;quota:number;quotaLeft:number}>;
    const after=data.tickets as typeof before;
    for(const ticket of before){const next=after.find(t=>t.id===ticket.id);const sold=ticket.quota-ticket.quotaLeft;if(sold>0&&(!next||next.quota<sold))throw new HttpError(409,"Tiket yang sudah dipesan tidak dapat dihapus atau dikurangi di bawah jumlah pesanan.");}
    after.forEach(t=>{const prev=before.find(v=>v.id===t.id);t.quotaLeft=t.quota-(prev?prev.quota-prev.quotaLeft:0)});
   }
   if(change.collection==="events")published=data.publication==="published";
   if(["cms","articles"].includes(change.collection))published=data.status==="Published";
   if(change.collection==="campaigns"&&old?.data.status!=="Queued"&&old)throw new HttpError(409,"Pesan yang sudah diproses tidak dapat diubah.");
  }
  changes.push({...change,data,owner_email,published});
 }
 await commit(changes);return json(await snapshot(user));
 }catch(error){return fail(error)}
}

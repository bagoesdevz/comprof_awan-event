import "server-only";
import { record, findEvent, commit } from "./platform";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { HttpError } from "./http";
import type { Registration, ManagedEvent } from "@/lib/platform-model";

export async function expireUnstartedRegistration(id:string,now=Date.now()) {
 const row=await record("registrations",id);
 const registration=row?.data as unknown as Registration|undefined;
 if(!row||!registration||registration.orderId||registration.payment!=="pending"||Date.parse(registration.createdAt)>now-24*3600000)return false;
 if(await record("payment_sessions",id))return false;
 const eventRow=await findEvent(registration.eventSlug),event=eventRow.data as unknown as ManagedEvent;
 const ticket=event.tickets.find(ticket=>ticket.id===registration.ticketId);
 if(!ticket)throw new HttpError(409,"Tiket pesanan belum dapat diperiksa.");
 ticket.quotaLeft=Math.min(ticket.quota,ticket.quotaLeft+registration.quantity);
 event.quotaLeft=event.tickets.reduce((sum,ticket)=>sum+ticket.quotaLeft,0);
 const {data:members,error}=await getServiceSupabaseClient().from("platform_records").select("*").eq("collection","registrations").eq("data->>orderId",id);
 if(error)throw new HttpError(503,"Peserta grup belum dapat diperiksa.");
 registration.payment="expired";
 await commit([
  {collection:"payment_sessions",id,revision:0,owner_email:row.owner_email,data:{closed:true,closedAt:new Date(now).toISOString()}},
  {collection:"events",id:eventRow.id,revision:eventRow.revision,published:eventRow.published,data:event as unknown as Record<string,unknown>},
  {collection:"registrations",id,revision:row.revision,owner_email:row.owner_email,data:registration as unknown as Record<string,unknown>},
  ...(members||[]).map(member=>({collection:"registrations" as const,id:member.id,revision:member.revision,owner_email:member.owner_email,data:{...(member.data as Record<string,unknown>),payment:"expired"}})),
 ]);
 return true;
}

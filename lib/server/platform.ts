import "server-only";
import type { User } from "@supabase/supabase-js";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { blankProfile,initialState,activityAllowed,type PlatformState,type ManagedEvent } from "@/lib/platform-model";
import type { RecordRow,Collection,Change } from "@/lib/platform-records";
import { HttpError } from "./http";
export function roleOf(user:User|null){const role=user?.app_metadata?.role;return role==="super"||role==="operational"?role:"participant";}
export function requireUser(user:User|null){if(!user?.email)throw new HttpError(401,"Masuk untuk melanjutkan.");return user as User & {email:string};}
export function requireAdmin(user:User|null,superOnly=false){const u=requireUser(user);if(roleOf(u)==="participant"||(superOnly&&roleOf(u)!=="super"))throw new HttpError(403,"Anda tidak memiliki akses.");return u;}
export async function records(collection:Collection|"payment_sessions",owner?:string,published?:boolean){
 const all:RecordRow[]=[];let from=0;
 while(true){let query=getServiceSupabaseClient().from("platform_records").select("*").eq("collection",collection).order("id").range(from,from+499);
 if(owner!==undefined)query=query.eq("owner_email",owner);if(published!==undefined)query=query.eq("published",published);
 const {data,error}=await query;if(error)throw new Error(error.message);all.push(...data as unknown as RecordRow[]);if(data.length<500)break;from+=500;
 }return all;
}
export async function record(collection:string,id:string){
 const {data,error}=await getServiceSupabaseClient().from("platform_records").select("*").eq("collection",collection).eq("id",id).maybeSingle();
 if(error)throw new Error(error.message);return data as unknown as RecordRow|null;
}
export async function findEvent(slug:string){const {data,error}=await getServiceSupabaseClient().from("platform_records").select("*").eq("collection","events").eq("data->>slug",slug).maybeSingle();if(error)throw new Error(error.message);if(!data)throw new HttpError(404,"Event tidak ditemukan.");return data as unknown as RecordRow;}
export function liveEvent(event:ManagedEvent):ManagedEvent{
 const now=Date.now();return {...event,lifecycle:now<new Date(event.startAt).getTime()?"upcoming":now>new Date(event.endAt).getTime()?"completed":"ongoing"};
}
export function eventForViewer(event:ManagedEvent,state:PlatformState,admin:boolean):ManagedEvent{
 const e=structuredClone(liveEvent(event));if(admin)return e;
 const reg=state.registrations.find(r=>r.eventSlug===e.slug);
 const canJoin=reg&&activityAllowed(reg,e,"webinar")&&(!e.accessOpensAt||Date.now()>=new Date(e.accessOpensAt).getTime());
 if(!canJoin){e.meetingUrl="";e.meetingId="";e.meetingPasscode="";}
 e.preTest.questions=e.preTest.questions.map(q=>({...q,correct:-1}));
 e.postTest.questions=e.postTest.questions.map(q=>({...q,correct:-1}));
 e.certificateTemplate="";e.coordinator="";e.evaluationPlan="";e.documentationPlan="";
 return e;
}
export async function snapshot(user:User|null){
 const state=initialState(),revisions:Record<string,number>={},admin=roleOf(user)!=="participant",email=user?.email?.toLowerCase();
 state.session={loggedIn:!!user,email:email||"",role:roleOf(user)};
 const groups=await Promise.all([
 records("events",undefined,admin?undefined:true),records("cms",undefined,admin?undefined:true),records("articles",undefined,admin?undefined:true),
 ...(email?[records("profiles",admin?undefined:email),records("registrations",admin?undefined:email),records("notices",admin?undefined:email)]:[]),
 ...(admin?[records("leads"),records("waitlist"),records("templates"),records("campaigns")]:[])
 ]);
 for(const row of groups.flat()){
  revisions[row.collection+":"+row.id]=row.revision;
  if(row.collection==="cms")state.cms[row.id]=row.data as PlatformState["cms"][string];
  else if(row.collection==="profiles")state.profiles[row.id]=row.data as unknown as PlatformState["profiles"][string];
  else (state[row.collection] as unknown[]).push(row.data);
 }
 if(email&&!state.profiles[email])state.profiles[email]=blankProfile(email,String(user?.user_metadata?.name||""));
 state.events=state.events.map(e=>eventForViewer(e,state,admin));state.registrations.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 return {state,revisions};
}
export async function commit(changes: Array<Omit<Change,"collection"> & {collection:Collection|"payment_sessions";owner_email?:string|null;published?:boolean}>){
 const {error}=await getServiceSupabaseClient().rpc("commit_platform_changes",{p_changes:changes as unknown as Json});
 if(error){if(error.code==="40001"||error.code==="23505")throw new HttpError(409,"Data sudah berubah. Muat ulang lalu coba lagi.");throw new Error(error.message);}
}

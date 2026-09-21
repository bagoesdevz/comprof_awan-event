import type { EventDetail } from "@/lib/event-types";




export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "cancelled" | "refunded";
export type Role = "participant" | "super" | "operational";
export type Profile = { name:string; email:string; phone:string; gender:string; birthPlace:string; profession:string; institution:string; city:string } & { address:string; province:string; birthDate:string; position:string; category:string; specialization:string; source:string };
export type Activity = "pre-test" | "attendance" | "post-test" | "feedback";
export type Question = { id:string; text:string; options:string[]; correct:number; score:number };
export type Assessment = { enabled:boolean; questions:Question[]; passingScore:number; attempts:number; timeLimit:number };
export type Block = { id:string; type:string; title:string; body:string; visible:boolean; image?:string };
export type CertificatePlacement = {
  name:{x:number;y:number;size:number;color:string};
  number:{x:number;y:number;size:number;color:string};
};
export type ManagedEvent = EventDetail & {
  detailRevision?: number;
  programType:string; lifecycle:"upcoming"|"ongoing"|"completed"; publication:"draft"|"published";
  endAt:string; capacity:number; waitlist:boolean; meetingProvider:"Zoom"|"Google Meet"; meetingUrl:string;
  meetingId:string; meetingPasscode:string; accessOpensAt:string;
  objectives?:string; learningMethods?:string[]; partner?:string; coordinator?:string;
  requirements?:string; evaluationPlan?:string; documentationPlan?:string;
  customFields:{id:string;label:string;required:boolean}[]; blocks:Block[];
  preTest:Assessment; postTest:Assessment; certificateEnabled:boolean; certificatePattern:string; certificateTemplate:string; certificatePlacement:CertificatePlacement;
  reminder:string; banner:string;
};
export type Registration = {
  id:string; eventSlug:string; email:string; name:string; phone:string; ticketId:string; ticketName:string; attendance:"ONLINE"|"ONSITE";
  quantity:number; amount:number; payment:PaymentStatus; createdAt:string; paidAt?:string; method?:string; fee:number; refund:number;
  answers:Record<string,string>; members:{name:string;email:string}[]; progress:Record<Activity,boolean>;
  attempts:Record<"pre-test"|"post-test",number>; scores:Partial<Record<"pre-test"|"post-test",number>>;
  feedback?:{overall:number;speaker:number;material:number;organization:number;comment:string};
  attendanceAt?:string; testStartedAt?:Partial<Record<"pre-test"|"post-test",string>>; certificate?:{number:string;token:string;issuedAt:string;status:"valid"|"revoked"};
};
export type Lead = {id:string;name:string;email:string;phone:string;institution:string;kind:string;message:string;status:string;pic:string;followUp:string;notes:string;history:string[]};
export type WaitEntry = {id:string;name:string;email:string;phone:string;eventSlug:string;ticketId:string;position:number;joinedAt:string;status:"waiting"|"notified"|"withdrawn"};
export type Notice = {id:string;email:string;title:string;body:string;href:string;createdAt:string;read:boolean};
export type Template = {id:string;name:string;category:string;body:string;active:boolean};
export type Campaign = {id:string;name:string;eventSlug:string;audience:string;templateId:string;body:string;schedule:string;status:"Queued"|"Sent"|"Delivered"|"Failed";recipients:number};
export type CmsArticle = {id:string;slug:string;title:string;category:string;cover:string;content:string;excerpt:string;author:string;seoTitle:string;seoDescription:string;publishDate:string;status:"Draft"|"Review"|"Published"|"Archived"};
export type PlatformState = {
  version:1; session:{loggedIn:boolean;email:string;role:Role}; profiles:Record<string,Profile>; events:ManagedEvent[];
  registrations:Registration[]; notices:Notice[]; leads:Lead[]; waitlist:WaitEntry[]; templates:Template[]; campaigns:Campaign[];
  cms:Record<string,{title:string;body:string;image:string;status:string}>; articles:CmsArticle[];
};
export const activityLabels:Record<Activity,string>={"pre-test":"Pre-test",attendance:"Kehadiran","post-test":"Post-test",feedback:"Feedback"};
export const paymentLabels:Record<PaymentStatus,string>={pending:"Menunggu pembayaran",paid:"Lunas",failed:"Gagal",expired:"Kedaluwarsa",cancelled:"Dibatalkan",refunded:"Dikembalikan"};
export const lifecycleLabels={upcoming:"Akan datang",ongoing:"Berlangsung",completed:"Selesai"};
export const money=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
export const emptyProgress=():Registration["progress"]=>({"pre-test":false,attendance:false,"post-test":false,feedback:false});
export const blankProfile=(email:string,name=""):Profile=>({name,email,phone:"",gender:"",birthPlace:"",profession:"",institution:"",city:"",address:"",province:"",birthDate:"",position:"",category:"Profesional",specialization:"",source:""});
export function profileComplete(p:Profile){return [p.name,p.email,p.phone,p.gender,p.birthPlace,p.birthDate,p.city,p.profession,p.source].every(v=>String(v||"").trim().length>0);}
export function manageEvent(event:EventDetail):ManagedEvent{
  return {...event,detailRevision:2,programType:event.programType||(event.type==="ONSITE"?"Workshop":"Webinar"),lifecycle:"upcoming",publication:"published",endAt:new Date(new Date(event.startAt).getTime()+3600000).toISOString(),capacity:event.tickets.reduce((n,t)=>n+t.quota,0),waitlist:true,meetingProvider:"Zoom",meetingUrl:"",meetingId:"",meetingPasscode:"",accessOpensAt:"",customFields:[],
    blocks:["Hero","Speaker","About","Benefits","Agenda","Access","Ticket","Countdown","FAQ","CTA"].map((type,i)=>({id:"block-"+i,type,title:type,body:"",visible:true})),
    preTest:{enabled:false,questions:[],passingScore:0,attempts:3,timeLimit:15},postTest:{enabled:false,questions:[],passingScore:70,attempts:3,timeLimit:15},
    certificateEnabled:false,certificatePattern:"AWN-{year}-{sequence}",certificateTemplate:"",certificatePlacement:{name:{x:50,y:47,size:42,color:"#211052"},number:{x:50,y:68,size:20,color:"#5D607D"}},reminder:"H-1 dan 2 jam sebelum event",banner:""};
}
export function newRegistration(event:ManagedEvent,ticketId:string,p:Profile):Registration{
 const t=event.tickets.find(t=>t.id===ticketId)||event.tickets[0];
 const free=t.price===0||t.pricingMode==="free";
 return {id:"AWN-"+crypto.randomUUID().replaceAll("-","").slice(0,10).toUpperCase(),eventSlug:event.slug,email:p.email,name:p.name,phone:p.phone,ticketId:t.id,ticketName:t.name,attendance:t.attendance,quantity:1,amount:t.price,payment:free?"paid":"pending",createdAt:new Date().toISOString(),paidAt:free?new Date().toISOString():undefined,method:free?"Gratis":undefined,fee:0,refund:0,answers:{},members:[],progress:emptyProgress(),attempts:{"pre-test":0,"post-test":0},scores:{}};
}
export const defaultProfile=blankProfile("");
export function initialState():PlatformState{return {
 version:1,session:{loggedIn:false,email:"",role:"participant"},profiles:{},events:[],registrations:[],notices:[],leads:[],waitlist:[],templates:[],campaigns:[],cms:{},articles:[]
};}
export function eligible(r:Registration,e?:ManagedEvent){return r.payment==="paid"&&(!e?.preTest.enabled||r.progress["pre-test"])&&r.progress.attendance&&(!e?.postTest.enabled||r.progress["post-test"])&&r.progress.feedback;}
export function nextAction(r:Registration,e:ManagedEvent){
 if(r.payment!=="paid")return {label:r.payment==="pending"?"Selesaikan pembayaran":"Tinjau pembayaran",href:`/events/${e.slug}/payment?registration=${r.id}&ticket=${r.ticketId}`,note:paymentLabels[r.payment]};
 if(e.preTest.enabled&&!r.progress["pre-test"])return {label:"Kerjakan pre-test",href:`/dashboard/events/${e.slug}/pre-test`,note:"Petakan pemahaman awal sebelum mengikuti sesi."};
 if(!r.progress.attendance)return {label:e.lifecycle==="upcoming"?"Lihat jadwal event":"Masuk ke event",href:`/dashboard/events/${e.slug}/webinar`,note:e.lifecycle==="upcoming"?"Akses dibuka saat event dimulai.":"Kehadiran dicatat saat kamu mengakses sesi."};
 if(e.postTest.enabled&&!r.progress["post-test"])return {label:e.lifecycle==="completed"?"Kerjakan post-test":"Kembali ke event",href:`/dashboard/events/${e.slug}/${e.lifecycle==="completed"?"post-test":"webinar"}`,note:"Post-test terbuka setelah sesi berakhir."};
 if(!r.progress.feedback)return {label:"Bagikan feedback",href:`/dashboard/events/${e.slug}/feedback`,note:"Satu langkah lagi menuju sertifikatmu."};
 return {label:"Lihat sertifikat",href:"/dashboard/certificates",note:"Empat persyaratan telah terpenuhi."};
}
export function activityAllowed(r:Registration,e:ManagedEvent,a:Activity|"webinar"){
 if(r.payment!=="paid")return false;
 if(a==="pre-test")return e.preTest.enabled;
 if(a==="webinar"||a==="attendance")return (!e.preTest.enabled||r.progress["pre-test"])&&e.lifecycle!=="upcoming";
 if(a==="post-test")return e.postTest.enabled&&(!e.preTest.enabled||r.progress["pre-test"])&&r.progress.attendance&&e.lifecycle==="completed";
 return (!e.postTest.enabled||r.progress["post-test"])&&e.lifecycle==="completed";
}
export function notify(s:PlatformState,email:string,title:string,body:string,href:string){s.notices.unshift({id:crypto.randomUUID(),email,title,body,href,createdAt:new Date().toISOString(),read:false});}
export function issueEligible(s:PlatformState){
 s.registrations.forEach(r=>{
  const e=s.events.find(e=>e.slug===r.eventSlug);if(!e)return;
  if(!e.certificateEnabled||!eligible(r,e)||r.certificate)return;
  const token=crypto.randomUUID();
  const seq=String(s.registrations.filter(r=>r.certificate).length+1).padStart(5,"0");
  r.certificate={number:e.certificatePattern.replaceAll("{year}",String(new Date().getFullYear())).replaceAll("{sequence}",seq),token,issuedAt:new Date().toISOString(),status:"valid"};
  notify(s,r.email,"Sertifikat siap","Selamat, semua persyaratan "+e.title+" telah terpenuhi.","/dashboard/certificates");
 });
}
export function safeNext(value:string|null){return value&&value.startsWith("/")&&!value.startsWith("//")&&!value.includes("\\")?value:"/dashboard";}

import "server-only";
import { z } from "zod";
import { whatsappGroupLink } from "@/lib/event-sharing";
import type {User} from "@supabase/supabase-js";
import {type ManagedEvent,type Registration,emptyProgress,activityAllowed,eligible} from "@/lib/platform-model";
import {record,records,findEvent,commit,requireUser,requireAdmin,liveEvent} from "./platform";
import {HttpError} from "./http";
import {issueCertificate} from "./certificates";
import {ensureEventPublicLinks} from "./event-links";
import {ticketState} from "@/lib/event-detail";
const registrationInput=z.object({type:z.literal("register"),eventSlug:z.string().max(120),ticketId:z.string().max(120),answers:z.record(z.string(),z.string().max(2000)).default({}),members:z.array(z.object({name:z.string().trim().min(2).max(160),email:z.string().trim().email().max(254)})).max(49).default([])});
const activityInput=z.object({type:z.enum(["start-test","submit-test","attendance","feedback","check-in","revoke-certificate"]),id:z.string().max(254),eventSlug:z.string().optional(),test:z.enum(["pre-test","post-test"]).optional(),answers:z.record(z.string(),z.number().int().min(0).max(7)).optional(),feedback:z.object({overall:z.number().int().min(1).max(5),speaker:z.number().int().min(1).max(5),material:z.number().int().min(1).max(5),organization:z.number().int().min(1).max(5),comment:z.string().max(3000)}).optional()});
export async function runAction(user:User|null,raw:unknown){
 const u=requireUser(user),email=u.email.toLowerCase();
 if((raw as {type?:unknown})?.type==="ensure-event-links"){
  z.object({type:z.literal("ensure-event-links")}).strict().parse(raw);
  return ensureEventPublicLinks(u);
 }
 if((raw as {type?:unknown})?.type==="register"){
  const input=registrationInput.parse(raw),er=await findEvent(input.eventSlug),event=liveEvent(er.data as unknown as ManagedEvent);
  if(!er.published||event.publication!=="published"||event.registrationStatus!=="OPEN")throw new HttpError(409,"Pendaftaran event ditutup.");
  const existingRegs=await records("registrations",email);
  const activeReg=existingRegs.find(row=>{const reg=row.data as unknown as Registration;return reg.eventSlug===event.slug&&!["cancelled","expired","refunded"].includes(reg.payment);});
  if(activeReg)throw new HttpError(409,"Anda sudah memiliki pendaftaran aktif untuk event ini.");
 const pr=await record("profiles",email);if(!pr)throw new HttpError(422,"Lengkapi profil sebelum mendaftar.");
 const p=pr.data;if(!p.name||!p.phone||!p.gender||!p.birthPlace||!p.birthDate||!p.city||!p.profession||!p.source)throw new HttpError(422,"Lengkapi profil sebelum mendaftar.");
  const ticket=event.tickets.find(t=>t.id===input.ticketId);const quantity=1+input.members.length;
  if(!ticket||ticketState(event,ticket,Date.now())!=="available"||ticket.quotaLeft<quantity||quantity>(ticket.quantityLimit||5))throw new HttpError(409,"Tiket tidak tersedia.");
  const emails=[email,...input.members.map(m=>m.email.toLowerCase())];if(new Set(emails).size!==emails.length)throw new HttpError(422,"Email setiap peserta harus berbeda.");
  for(const field of event.customFields)if(field.required&&!input.answers[field.id]?.trim())throw new HttpError(422,"Isi "+field.label+".");
  const now=new Date().toISOString(),r:Registration={id:"AWN-"+crypto.randomUUID().replaceAll("-","").slice(0,16).toUpperCase(),eventSlug:event.slug,email,name:String(p.name),phone:String(p.phone),ticketId:ticket.id,ticketName:ticket.name,attendance:ticket.attendance,quantity,amount:ticket.price*quantity,payment:ticket.price===0?"paid":"pending",createdAt:now,...(ticket.price===0?{paidAt:now,method:"Gratis"}:{}),fee:0,refund:0,answers:input.answers,members:input.members,progress:emptyProgress(),attempts:{"pre-test":0,"post-test":0},scores:{}};
  ticket.quotaLeft-=quantity;event.quotaLeft=event.tickets.reduce((n,t)=>n+t.quotaLeft,0);
  const memberRegistrations:Registration[]=input.members.map(member=>({
   ...structuredClone(r),id:"AWN-"+crypto.randomUUID().replaceAll("-","").slice(0,16).toUpperCase(),orderId:r.id,
   name:member.name.trim(),email:member.email.toLowerCase(),phone:"",quantity:1,amount:0,members:[],answers:{},
  }));
  await commit([
   {collection:"events",id:er.id,revision:er.revision,data:event as unknown as Record<string,unknown>,published:er.published},
   ...[r,...memberRegistrations].map(registration=>({collection:"registrations" as const,id:registration.id,revision:0,data:registration as unknown as Record<string,unknown>,owner_email:registration.email})),
  ]);
  return {registration:r,whatsappGroupUrl:whatsappGroupLink(event.whatsappGroupUrl)};
 }
 const input=activityInput.parse(raw),rr=await record("registrations",input.id);
 if(!rr)throw new HttpError(404,"Pendaftaran tidak ditemukan.");
 const adminAction=input.type==="check-in"||input.type==="revoke-certificate";
 if(adminAction)requireAdmin(u,input.type==="revoke-certificate");else if(rr.owner_email!==email)throw new HttpError(403,"Pendaftaran tidak diizinkan.");
 const r=structuredClone(rr.data) as unknown as Registration,er=await findEvent(r.eventSlug),event=liveEvent(er.data as unknown as ManagedEvent);
 if(input.type==="revoke-certificate"){
  if(!r.certificate)throw new HttpError(409,"Sertifikat belum terbit.");r.certificate.status="revoked";
 }else if(input.type==="check-in"||input.type==="attendance"){
  if(r.payment!=="paid")throw new HttpError(409,"Pembayaran belum lunas.");
  if(input.type==="check-in"&&input.eventSlug!==r.eventSlug)throw new HttpError(409,"Tiket untuk event yang berbeda.");
  if(r.progress.attendance)throw new HttpError(409,"Peserta sudah tercatat hadir.");
  if(!adminAction&&(!activityAllowed(r,event,"attendance")||!event.meetingUrl||event.accessOpensAt&&Date.now()<Date.parse(event.accessOpensAt)))throw new HttpError(409,"Akses pertemuan belum dibuka.");
  if(adminAction&&event.lifecycle!=="ongoing")throw new HttpError(409,"Check-in tersedia saat event berlangsung.");
  r.progress.attendance=true;r.attendanceAt=new Date().toISOString();
 }else if(input.type==="feedback"){
  if(!activityAllowed(r,event,"feedback")||!input.feedback)throw new HttpError(409,"Feedback belum tersedia.");
  r.feedback=input.feedback;r.progress.feedback=true;
 }else{
  const key=input.test;if(!key)throw new HttpError(422,"Pilih evaluasi.");const test=key==="pre-test"?event.preTest:event.postTest;
  if(!activityAllowed(r,event,key)||r.progress[key])throw new HttpError(409,"Evaluasi tidak tersedia.");
  if(r.attempts[key]>=test.attempts)throw new HttpError(409,"Batas percobaan tercapai.");
  r.testStartedAt||={};
  if(input.type==="start-test"){
   // Resume the existing attempt without resetting its timer.
   if(!r.testStartedAt[key])r.testStartedAt[key]=new Date().toISOString();
  }else{
   const start=r.testStartedAt[key];if(!start)throw new HttpError(409,"Mulai evaluasi terlebih dahulu.");
   const expired=Date.now()-Date.parse(start)>test.timeLimit*60000;
   const total=test.questions.reduce((n,q)=>n+q.score,0),correct=test.questions.reduce((n,q)=>n+(input.answers?.[q.id]===q.correct?q.score:0),0);
   const score=expired||!total?0:Math.round(correct/total*100);
   r.attempts[key]++;r.scores[key]=score;r.progress[key]=!expired&&score>=test.passingScore;delete r.testStartedAt[key];
  }
 }
 issueCertificate(r,event);
 await commit([{collection:"registrations",id:r.id,revision:rr.revision,data:r as unknown as Record<string,unknown>,owner_email:rr.owner_email}]);
 return {registration:r,message:input.type==="check-in"?r.name+" tercatat hadir.":"Perubahan tersimpan."};
}

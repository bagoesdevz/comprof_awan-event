"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { usePlatform } from "@/components/platform/provider";
import { Badge, Empty, Field, Panel } from "@/components/platform/ui";
import { defaultProfile, money, profileComplete, type Registration } from "@/lib/platform-model";
import { whatsappGroupLink } from "@/lib/event-sharing";
import { RegistrationGroupDialog } from "@/components/registration/registration-group-dialog";
import { ProfileEditor } from "@/components/platform/profile-editor";
import { EventGroupAccess } from "@/components/dashboard/event-group-access";
import { registrationStatusAt, ticketState, eventDateTime } from "@/lib/event-detail";
export function RegistrationWizard({eventSlug,ticketId}:{eventSlug:string;ticketId:string;ticketName?:string}){
 const {state,ready,action,saving,error:platformError,refresh}=usePlatform();const router=useRouter();const [step,setStep]=useState(0);const [selected,setSelected]=useState(ticketId);const [quantity,setQuantity]=useState(1);const [answers,setAnswers]=useState<Record<string,string>>({});const [members,setMembers]=useState<{name:string;email:string}[]>([]);const [error,setError]=useState("");
 const [now,setNow]=useState(Date.now);
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer);},[]);
 const [completed,setCompleted]=useState<{registration:Registration;groupUrl:string}|null>(null);
 const destination=(r:Registration)=>r.payment==="paid"?"/dashboard/events/"+eventSlug:"/events/"+eventSlug+"/payment?registration="+encodeURIComponent(r.id);
 const event=state.events.find(e=>e.slug===eventSlug);const profile=state.profiles[state.session.email]||defaultProfile;const existing=state.registrations.find(r=>r.eventSlug===eventSlug&&r.email===state.session.email&&!["cancelled","refunded","expired"].includes(r.payment));
 if(!ready&&platformError)return <Panel title="Pendaftaran belum dapat dimuat"><p role="alert">{platformError}</p><button className="flow-button mt-4" onClick={()=>void refresh()}>Coba lagi</button></Panel>;
 if(!ready)return <p role="status">Menyiapkan pendaftaran…</p>;
 if(!event||event.publication!=="published")return <Panel title="Event belum tersedia"><p className="mb-4 text-sm">Event belum dipublikasikan atau datanya belum diperbarui. Coba muat ulang untuk memeriksa kembali.</p><button className="flow-button" onClick={()=>void refresh()}>Muat ulang event</button></Panel>;
 const returnTo="/events/"+eventSlug+"/register"+(ticketId?"?ticket="+encodeURIComponent(ticketId):"");
 if(!state.session.loggedIn)return <Panel title="Masuk untuk mendaftar"><Link className="flow-button" href={"/login?next="+encodeURIComponent(returnTo)}>Masuk / buat akun</Link></Panel>;
 if(completed)return <RegistrationGroupDialog registration={completed.registration} eventTitle={event.title} groupUrl={completed.groupUrl} onContinue={()=>router.push(destination(completed.registration))}/>;
 if(existing)return <><Panel title="Pendaftaran Anda sudah tersimpan"><Badge tone={existing.payment==="paid"?"success":"warning"}>{existing.payment==="paid"?"Terkonfirmasi":"Belum lunas"}</Badge><p className="my-5 text-sm">{existing.id} · {existing.ticketName}</p><Link className="flow-button" href={existing.payment==="paid"?"/dashboard/events/"+eventSlug:`/events/${eventSlug}/payment?registration=${existing.id}&ticket=${existing.ticketId}`}>{existing.payment==="paid"?"Buka perjalanan event":"Lanjutkan pembayaran"}</Link></Panel><EventGroupAccess slug={eventSlug}/></>;
 const status=registrationStatusAt(event,now);
 if(status!=="OPEN"){
  const opening=event.tickets.filter(t=>ticketState(event,t,now)==="scheduled"&&t.startsAt&&Date.parse(t.startsAt)>now).map(t=>Date.parse(t.startsAt!)).sort((a,b)=>a-b)[0];
  return <Empty title={status==="SOLD_OUT"?"Kuota event penuh":status==="COMING_SOON"?"Pendaftaran belum dibuka":"Pendaftaran ditutup"} description={status==="COMING_SOON"&&opening?`Pendaftaran dibuka ${eventDateTime(new Date(opening).toISOString())}.`:"Pendaftaran mengikuti jadwal dan kuota yang ditetapkan penyelenggara."} href={status==="SOLD_OUT"&&event.waitlist?"/waitlist/"+eventSlug:undefined} label="Gabung daftar tunggu"/>;
 }
 if(!profileComplete(profile))return <ProfileEditor registrationEventTitle={event.title}/>;
 const ticket=event.tickets.find(t=>t.id===selected)||event.tickets.find(t=>ticketState(event,t,now)==="available")||event.tickets[0];
 if(!ticket)return <Empty title="Tiket belum tersedia" href="/events"/>;
 const ticketAvailable=(t:typeof ticket)=>ticketState(event,t,now)==="available";
 async function submit(e:FormEvent){
 e.preventDefault();setError("");if(step<2){setStep(step+1);return;}
 if(!event||!ticket||!ticketAvailable(ticket)){setError("Tiket tidak tersedia.");return;}
 const result=await action({type:"register",eventSlug,ticketId:ticket.id,answers,members});if(!result)return;
 const r=result.registration as Registration;
 if(!r?.id){setError("Pendaftaran belum dapat dikonfirmasi. Muat ulang untuk memeriksa status Anda.");return;}
 const savedState=whatsappGroupLink(result.whatsappGroupUrl)?null:await refresh();
 const groupUrl=whatsappGroupLink(result.whatsappGroupUrl)||whatsappGroupLink(savedState?.events.find(item=>item.slug===eventSlug)?.whatsappGroupUrl);
 if(groupUrl)setCompleted({registration:r,groupUrl});else router.push(destination(r));
 }
 return <div><ol className="flow-tabs" aria-label="Langkah pendaftaran">{["Data event","Periksa data","Pilih tiket"].map((label,i)=><li key={label} className="flex-1"><span className={"block rounded-2xl px-4 py-3 text-sm "+(step===i?"bg-primary-950 text-white":"bg-primary-100")}>{i+1}. {label}</span></li>)}</ol><Panel title={["Data peserta untuk event ini","Periksa sebelum melanjutkan","Pilih tiket dan jumlah peserta"][step]}><form onSubmit={submit}>{step===0?<div className="grid gap-6"><div className="rounded-2xl bg-primary-100 p-5"><strong>{profile.name}</strong><p className="mt-2 text-sm">{profile.email} · {profile.phone}</p><p className="mt-1 text-sm">{profile.institution} · {profile.profession}</p><Link className="mt-3 inline-block text-sm text-primary-600 underline" href={"/dashboard/profile?next="+encodeURIComponent(returnTo)}>Ubah profil</Link></div>{event.customFields.map(f=><Field key={f.id} label={f.label+(f.required?" *":"")}><input required={f.required} value={answers[f.id]||""} onChange={e=>setAnswers({...answers,[f.id]:e.target.value})}/></Field>)}</div>:step===1?<div><dl className="grid gap-4 sm:grid-cols-2">{[["Nama pada sertifikat",profile.name],["Email",profile.email],["WhatsApp",profile.phone],["Institusi",profile.institution],...event.customFields.map(f=>[f.label,answers[f.id]||"Belum tersedia"])].map(([l,v])=><div key={l}><dt className="text-xs text-content-muted">{l}</dt><dd className="mt-1 break-words font-medium">{v}</dd></div>)}</dl><label className="mt-7 flex items-start gap-3 text-sm"><input required type="checkbox" className="mt-1"/>Data sudah benar dan boleh digunakan untuk administrasi event.</label></div>:<div className="grid gap-4">{event.tickets.map(t=><label key={t.id} className={"flex cursor-pointer gap-3 rounded-2xl border p-5 "+(selected===t.id?"border-primary-600 bg-primary-100":"border-content-title/10")}><input type="radio" name="ticket" checked={ticket.id===t.id} disabled={!ticketAvailable(t)} onChange={()=>{setSelected(t.id);setMembers([]);setQuantity(1);}}/><div className="min-w-0 flex-1"><strong>{t.name}</strong><p className="mt-2 text-sm">{t.price===0?"Gratis":money(t.price)+" / peserta"} · {t.quotaLeft} kursi</p><p className="mt-2 text-xs text-content-muted">{t.benefits.join(" · ")}</p>{!ticketAvailable(t)&&<Badge tone="warning">Tidak tersedia</Badge>}</div></label>)}{/group|corporate/i.test(ticket.name)&&<div className="grid gap-3">{members.map((m,i)=><div key={i} className="grid gap-3 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2"><Field label={"Nama peserta "+(i+2)}><input required value={m.name} onChange={e=>setMembers(members.map((v,j)=>j===i?{...v,name:e.target.value}:v))}/></Field><Field label="Email peserta"><input type="email" required value={m.email} onChange={e=>setMembers(members.map((v,j)=>j===i?{...v,email:e.target.value}:v))}/></Field><button type="button" className="text-sm text-primary-600" onClick={()=>setMembers(members.filter((_,j)=>j!==i))}>Hapus peserta ini</button></div>)}<button type="button" className="flow-button secondary" disabled={members.length+1>=Math.min(ticket.quantityLimit||5,ticket.quotaLeft)} onClick={()=>setMembers([...members,{name:"",email:""}])}>Tambah peserta</button></div>}<div className="flex justify-between border-t pt-5"><span>Total · {1+members.length} peserta</span><strong>{ticket.price===0?"Gratis":money(ticket.price*(1+members.length))}</strong></div></div>}{error&&<p role="alert" className="flow-alert danger mt-5">{error}</p>}<div className="mt-8 flex flex-wrap justify-between gap-3">{step>0?<button type="button" className="flow-button secondary" onClick={()=>setStep(step-1)}>Kembali</button>:<span/>}<button disabled={saving} className="flow-button">{step===2?(ticket.price===0?"Konfirmasi pendaftaran":"Simpan & bayar"):"Lanjutkan"}</button></div></form></Panel></div>;
}

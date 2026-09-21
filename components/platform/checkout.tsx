"use client";
import Link from "next/link";
import {useState} from "react";
import {usePlatform} from "./provider";
import {Badge,Empty,PageHeading,Panel} from "./ui";
import {money,paymentLabels} from "@/lib/platform-model";
export function Checkout({slug,registrationId}:{slug:string;registrationId?:string}){
 const {state,refresh}=usePlatform();const [busy,setBusy]=useState(false),[error,setError]=useState("");
 const r=state.registrations.find(r=>r.email===state.session.email&&r.eventSlug===slug&&(!registrationId||r.id===registrationId));
 const event=state.events.find(e=>e.slug===slug);
 async function pay(check=false){if(!r)return;setBusy(true);setError("");try{const response=await fetch(check?"/api/payments?registration="+r.id:"/api/payments",{method:check?"GET":"POST",headers:{"Content-Type":"application/json"},...(!check?{body:JSON.stringify({registrationReference:r.id})}:{})});const data=await response.json();if(!response.ok)throw new Error(data.error?.message||"Pembayaran belum tersedia.");if(check)await refresh();else window.location.assign(data.data.paymentUrl);}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 if(!r||!event)return <Empty title="Pendaftaran tidak ditemukan" href="/dashboard/payments" label="Riwayat pembayaran"/>;
 return <div className="mx-auto max-w-4xl"><PageHeading title="Pembayaran" description={event.title}/><div className="grid gap-6 md:grid-cols-2"><Panel title="Status pembayaran"><Badge tone={r.payment==="paid"?"success":"warning"}>{paymentLabels[r.payment]}</Badge>{r.payment==="paid"?<Link className="flow-button mt-6" href={"/dashboard/events/"+slug}>Buka event</Link>:<div className="mt-6 grid gap-3">{r.payment==="pending"&&<button disabled={busy} className="flow-button" onClick={()=>pay()}>{busy?"Memproses…":"Bayar dengan Midtrans"}</button>}<button disabled={busy} className="flow-button secondary" onClick={()=>pay(true)}>Periksa status pembayaran</button></div>}{error&&<p role="alert" className="flow-alert danger mt-5">{error}</p>}</Panel><Panel title="Ringkasan"><dl className="grid gap-4 text-sm">{[["Pendaftaran",r.id],["Nama",r.name],["Tiket",r.ticketName],["Peserta",String(r.quantity)],["Total",money(r.amount+r.fee)]].map(([label,value])=><div key={label} className="flex flex-wrap justify-between gap-3 border-b border-primary-100 pb-3"><dt>{label}</dt><dd className="break-all font-semibold">{value}</dd></div>)}</dl></Panel></div></div>;
}

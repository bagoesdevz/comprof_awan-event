"use client";
import { useState } from "react";
import { usePlatform } from "@/components/platform/provider";
import { PageHeading,Panel,Empty,Field,Badge,exportCsv } from "@/components/platform/ui";
import { money,paymentLabels } from "@/lib/platform-model";
export function Transactions(){
 const {state}=usePlatform();const [query,setQuery]=useState(""),[status,setStatus]=useState("all");
 const rows=state.registrations.filter(r=>(status==="all"||r.payment===status)&&[r.name,r.email,r.id].join(" ").toLowerCase().includes(query.toLowerCase()));
 return <div><PageHeading title="Pembayaran" action={<button className="flow-button secondary" onClick={()=>exportCsv("pembayaran",["Pendaftaran","Nama","Email","Jumlah","Status"],rows.map(r=>[r.id,r.name,r.email,r.amount,paymentLabels[r.payment]]))}>Ekspor CSV</button>}/><Panel><div className="mb-6 grid gap-4 sm:grid-cols-[1fr_auto]"><Field label="Cari transaksi"><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nama, email, atau nomor pendaftaran"/></Field><Field label="Status"><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Semua status</option>{Object.entries(paymentLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></Field></div>{rows.length?<div className="flow-table-wrap"><table className="flow-table"><thead><tr><th>Pendaftaran</th><th>Peserta</th><th>Event</th><th>Jumlah</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.id}<small>{new Date(r.createdAt).toLocaleDateString("id-ID")}</small></td><td>{r.name}<small>{r.email}</small></td><td>{state.events.find(e=>e.slug===r.eventSlug)?.title}<small>{r.ticketName}</small></td><td>{money(r.amount)}</td><td><Badge tone={r.payment==="paid"?"success":"warning"}>{paymentLabels[r.payment]}</Badge></td></tr>)}</tbody></table></div>:<Empty title="Belum ada transaksi yang sesuai"/>}</Panel></div>;
}

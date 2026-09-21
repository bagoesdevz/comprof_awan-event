"use client";
import Link from "next/link";
import { useState } from "react";
import { usePlatform } from "@/components/platform/provider";
import { Badge, Empty, Field, PageHeading, Panel, exportCsv } from "@/components/platform/ui";
import { money, paymentLabels } from "@/lib/platform-model";
export function AdminOverview({reports=false}:{reports?:boolean}){
 const {state}=usePlatform();const [period,setPeriod]=useState("all");const start=new Date();start.setMonth(start.getMonth()-Number(period));
 const rows=state.registrations.filter(r=>period==="all"||new Date(r.createdAt)>=start);const paid=rows.filter(r=>r.payment==="paid");
 const stats=[["Event tayang",state.events.filter(e=>e.publication==="published").length],["Peserta",rows.reduce((n,r)=>n+r.quantity,0)],["Pendapatan",money(paid.reduce((n,r)=>n+r.amount-r.refund,0))],["Kehadiran",rows.filter(r=>r.progress.attendance).length]];
 return <div><PageHeading title={reports?"Laporan":"Ringkasan"} action={reports?<button className="flow-button secondary" onClick={()=>exportCsv("laporan-event",["Pendaftaran","Event","Peserta","Jumlah","Status"],rows.map(r=>[r.id,state.events.find(e=>e.slug===r.eventSlug)?.title||r.eventSlug,r.name,r.amount,paymentLabels[r.payment]]))}>Ekspor CSV</button>:<Link href="/admin/events/new" className="flow-button">Buat event</Link>}/>
 {reports&&<div className="mb-6 max-w-xs"><Field label="Periode"><select value={period} onChange={e=>setPeriod(e.target.value)}><option value="all">Semua waktu</option><option value="1">Sebulan terakhir</option><option value="3">3 bulan terakhir</option><option value="6">6 bulan terakhir</option></select></Field></div>}
 <div className="flow-kpi">{stats.map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
 <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"><Panel title="Transaksi terbaru" extra={<Link href="/admin/payments" className="text-sm text-primary-700">Lihat semua</Link>}>{rows.length?<div className="flow-table-wrap"><table className="flow-table"><thead><tr><th>Peserta</th><th>Event</th><th>Jumlah</th><th>Status</th></tr></thead><tbody>{rows.slice(0,reports?100:5).map(r=><tr key={r.id}><td>{r.name}</td><td>{state.events.find(e=>e.slug===r.eventSlug)?.title}</td><td>{money(r.amount)}</td><td><Badge tone={r.payment==="paid"?"success":"warning"}>{paymentLabels[r.payment]}</Badge></td></tr>)}</tbody></table></div>:<Empty title="Belum ada transaksi"/>}</Panel>
 <Panel title="Jadwal event">{state.events.length?state.events.map(e=><Link key={e.id} href={"/admin/events/"+e.slug} className="block border-b border-primary-100 py-4 first:pt-0 last:border-0"><strong className="block text-sm">{e.title}</strong><span className="mt-2 block text-sm text-content-muted">{new Date(e.startAt).toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"})}</span></Link>):<Empty title="Belum ada jadwal" href="/admin/events/new" label="Buat event"/>}</Panel></div></div>;
}

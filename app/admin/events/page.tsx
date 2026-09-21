"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Pencil, Eye } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { Badge, Empty, Field, PageHeading, Panel } from "@/components/platform/ui";
import { money } from "@/lib/platform-model";

export default function Page() {
 const {state,update,saving}=usePlatform();
 const [query,setQuery]=useState(""); const [filter,setFilter]=useState("all");
 const events=state.events.filter(e=>e.title.toLocaleLowerCase("id-ID").includes(query.toLocaleLowerCase("id-ID"))&&(filter==="all"||e.publication===filter));
 return <div><PageHeading title="Event" action={<Link href="/admin/events/new" className="flow-button"><Plus size={18}/>Buat event</Link>}/>
 <Panel><div className="mb-6 grid items-end gap-4 sm:grid-cols-[1fr_auto]"><Field label="Cari event"><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nama event"/></Field><Field label="Publikasi"><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Semua status</option><option value="published">Tayang</option><option value="draft">Draft</option></select></Field></div>
 {events.length?<div className="grid divide-y divide-primary-100">{events.map(event=>{
 const rows=state.registrations.filter(r=>r.eventSlug===event.slug);
 return <article key={event.id} className="grid gap-5 py-6 first:pt-0 lg:grid-cols-[minmax(0,1fr)_auto]"><div><div className="mb-3 flex flex-wrap gap-2"><Badge tone={event.publication==="published"?"success":"neutral"}>{event.publication==="published"?"Tayang":"Draft"}</Badge><Badge>{event.programType}</Badge></div><h2 className="text-xl font-semibold"><Link href={"/admin/events/"+event.slug}>{event.title}</Link></h2><p className="mt-2 text-sm text-content-muted">{new Date(event.startAt).toLocaleDateString("id-ID")} · {rows.reduce((n,r)=>n+r.quantity,0)} peserta · {money(rows.filter(r=>r.payment==="paid").reduce((n,r)=>n+r.amount,0))}</p></div><div className="admin-actions items-center"><Link className="flow-button secondary" href={"/admin/events/"+event.slug}><Pencil size={16}/>Edit</Link><Link className="flow-button secondary" href={"/events/"+event.slug}><Eye size={16}/>Lihat</Link><button disabled={saving} className="flow-button secondary" onClick={()=>update(s=>{const e=s.events.find(e=>e.id===event.id)!;e.publication=e.publication==="published"?"draft":"published";})}>{event.publication==="published"?"Jadikan draft":"Tayangkan"}</button></div></article>;
 })}</div>:<Empty title="Belum ada event" href="/admin/events/new" label="Buat event"/>}</Panel></div>;
}

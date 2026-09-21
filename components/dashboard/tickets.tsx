"use client";
import Link from "next/link";
import { usePlatform } from "@/components/platform/provider";
import { Empty, PageHeading, Panel, Badge } from "@/components/platform/ui";
import { TicketCode } from "./ticket-code";
export function Tickets({id}:{id?:string}){
 const {state}=usePlatform();const rows=state.registrations.filter(r=>r.email===state.session.email&&r.payment==="paid"&&(!id||r.id===id));
 return <div><PageHeading title={id?"Detail tiket":"Tiket saya"}/>{rows.length?<div className="grid gap-5 lg:grid-cols-2">{rows.map(r=>{const e=state.events.find(e=>e.slug===r.eventSlug);return <Panel key={r.id}><Badge tone="success">Aktif</Badge><h2 className="my-5 text-xl font-semibold">{e?.title}</h2><div className="flex flex-wrap items-start gap-6"><TicketCode value={r.id}/><div className="min-w-0"><strong>{r.name}</strong><p className="my-2 text-sm">{r.ticketName}</p><p className="break-all text-sm text-content-muted">{r.id}</p><p className="mt-2 text-sm">{e&&new Date(e.startAt).toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"})}</p></div></div><Link href={"/dashboard/events/"+r.eventSlug} className="flow-button secondary mt-6">Buka event</Link></Panel>})}</div>:<Empty title={id?"Tiket tidak ditemukan":"Belum ada tiket aktif"} href="/events"/>}</div>;
}

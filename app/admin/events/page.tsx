"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Plus, Pencil, Eye } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { Badge, Empty, Field, PageHeading, Panel } from "@/components/platform/ui";
import { money } from "@/lib/platform-model";
import { eventVisual } from "@/lib/event-detail";

export default function Page() {
  const { state, update, saving } = usePlatform();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const events = state.events.filter(event => event.title.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID")) && (filter === "all" || event.publication === filter));
  const filtered = Boolean(query.trim()) || filter !== "all";
  function reset() { setQuery(""); setFilter("all"); }

  return <div>
    <PageHeading title="Event" action={<Link href="/admin/events/new" className="flow-button"><Plus size={18} aria-hidden="true" />Buat event</Link>} />
    <Panel>
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        <Field label="Cari event"><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nama event" /></Field>
        <Field label="Publikasi"><select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Semua status</option><option value="published">Tayang</option><option value="draft">Draf</option></select></Field>
      </div>
      <div className="admin-filter-summary"><span role="status">{events.length} dari {state.events.length} event</span>{filtered && <button type="button" onClick={reset}>Hapus filter</button>}</div>
      {events.length ? events.map(event => {
        const rows = state.registrations.filter(registration => registration.eventSlug === event.slug);
        const visual = eventVisual(event, event.blocks.find(block => block.type === "Hero"));
        return <article key={event.id} className="admin-event-row">
          <div className="admin-event-cover"><Image src={visual?.src || "/awan-event-logo.jpeg"} alt="" unoptimized fill sizes="76px" /></div>
          <div className="admin-event-copy">
            <div className="mb-2 flex flex-wrap gap-2"><Badge tone={event.publication === "published" ? "success" : "neutral"}>{event.publication === "published" ? "Tayang" : "Draf"}</Badge><Badge>{event.programType}</Badge></div>
            <h2><Link href={`/admin/events/${event.slug}`}>{event.title}</Link></h2>
            <p className="mt-2 text-sm text-content-muted">{new Date(event.startAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })} · {rows.filter(registration => registration.payment === "paid").length} peserta · {money(rows.filter(registration => registration.payment === "paid" && !registration.orderId).reduce((sum, registration) => sum + registration.amount - registration.refund, 0))}</p>
          </div>
          <div className="admin-actions items-center">
            <Link className="flow-button secondary" href={`/admin/events/${event.slug}`} aria-label={`Edit ${event.title}`}><Pencil size={16} aria-hidden="true" />Edit</Link>
            <Link className="flow-button secondary" href={`/events/${event.slug}`} aria-label={`Lihat ${event.title}`}><Eye size={16} aria-hidden="true" />Lihat</Link>
            <button disabled={saving} type="button" className="flow-button secondary" onClick={() => void update(draft => { const record = draft.events.find(item => item.id === event.id); if (record) record.publication = record.publication === "published" ? "draft" : "published"; })}>{event.publication === "published" ? "Jadikan draf" : "Tayangkan"}</button>
          </div>
        </article>;
      }) : filtered ? <div><Empty title="Tidak ada event yang sesuai" description="Coba nama atau status publikasi lain." /><div className="mt-4 text-center"><button className="flow-button secondary" onClick={reset}>Hapus filter</button></div></div> : <Empty title="Belum ada event" description="Mulai dengan menyiapkan program pertama Anda." href="/admin/events/new" label="Buat event" />}
    </Panel>
  </div>;
}

"use client";

import Image from "next/image";
import { eventPublicPath } from "@/lib/event-sharing";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { Badge, Empty, Field, PageHeading, Panel } from "@/components/platform/ui";
import { money, type ManagedEvent } from "@/lib/platform-model";
import { eventVisual } from "@/lib/event-detail";

export default function Page() {
  const { state, update, action, saving, error } = usePlatform();
  const isSuper = state.session.role === "super";
  const [trash, setTrash] = useState(false);
  const [target, setTarget] = useState<{ event: ManagedEvent; restore: boolean } | null>(null);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!isSuper) { setTarget(null); setTrash(false); } }, [isSuper]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const source = isSuper && trash ? state.eventTrash || [] : state.events;
  const events = source.filter(event => event.title.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID")) && (filter === "all" || event.publication === filter));
  const filtered = Boolean(query.trim()) || filter !== "all";
  function reset() { setQuery(""); setFilter("all"); }
  const protectedEvent = !!target && state.registrations.some(registration => registration.eventSlug === target.event.slug);
  async function confirm() {
    if (!target || !isSuper || saving) return;
    setFailed(false);
    const result = await action({ type: target.restore ? "restore-event" : "delete-event", id: target.event.id, confirmed: true });
    if (!result) { setFailed(true); return; }
    setNotice(String(result.message)); setTarget(null);
  }

  return <div>
    <PageHeading title="Event" action={<Link href="/admin/events/new" className="flow-button"><Plus size={18} aria-hidden="true" />Buat event</Link>} />
    {isSuper && <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Daftar event"><button type="button" aria-pressed={!trash} className="flow-button secondary" onClick={() => { setTrash(false); reset(); }}>Event aktif</button><button type="button" aria-pressed={trash} className="flow-button secondary" onClick={() => { setTrash(true); reset(); }}>Sampah ({state.eventTrash?.length || 0})</button></div>}
    {notice && <p role="status" className="flow-alert success mb-5">{notice}</p>}
    <Panel>
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        <Field label="Cari event"><input ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nama event" /></Field>
        <Field label="Publikasi"><select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Semua status</option><option value="published">Tayang</option><option value="draft">Draf</option></select></Field>
      </div>
      <div className="admin-filter-summary"><span role="status">{events.length} dari {source.length} event{trash ? " di Sampah" : ""}</span>{filtered && <button type="button" onClick={reset}>Hapus filter</button>}</div>
      {events.length ? events.map(event => {
        const rows = state.registrations.filter(registration => registration.eventSlug === event.slug);
        const visual = eventVisual(event, event.blocks.find(block => block.type === "Hero"));
        return <article key={event.id} className="admin-event-row">
          <div className="admin-event-cover"><Image src={visual?.src || "/awan-event-logo.jpeg"} alt="" unoptimized fill sizes="76px" /></div>
          <div className="admin-event-copy">
            <div className="mb-2 flex flex-wrap gap-2"><Badge tone={event.publication === "published" ? "success" : "neutral"}>{trash ? "Sampah" : event.publication === "published" ? "Tayang" : "Draf"}</Badge><Badge>{event.programType}</Badge></div>
            <h2>{trash ? event.title : <Link href={`/admin/events/${event.slug}`}>{event.title}</Link>}</h2>
            <p className="mt-2 text-sm text-content-muted">{new Date(event.startAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })} · {rows.filter(registration => registration.payment === "paid").length} peserta · {money(rows.filter(registration => registration.payment === "paid" && !registration.orderId).reduce((sum, registration) => sum + registration.amount - registration.refund, 0))}</p>
          </div>
          <div className="admin-actions items-center">
            {trash ? <button disabled={saving} type="button" className="flow-button secondary" onClick={() => { setFailed(false); setTarget({ event, restore: true }); }}>Pulihkan sebagai draf</button> : <>
            <Link className="flow-button secondary" href={`/admin/events/${event.slug}`} aria-label={`Edit ${event.title}`}><Pencil size={16} aria-hidden="true" />Edit</Link>
            <Link className="flow-button secondary" href={eventPublicPath(event)} aria-label={`Lihat ${event.title}`}><Eye size={16} aria-hidden="true" />Lihat</Link>
            <button disabled={saving} type="button" className="flow-button secondary" onClick={() => void update(draft => { const record = draft.events.find(item => item.id === event.id); if (record) record.publication = record.publication === "published" ? "draft" : "published"; })}>{event.publication === "published" ? "Jadikan draf" : "Tayangkan"}</button>
            {isSuper && <button disabled={saving} type="button" aria-label={`Hapus ${event.title}`} className="flow-button secondary text-[#B42318]" onClick={() => { setFailed(false); setTarget({ event, restore: false }); }}><Trash2 size={16} aria-hidden="true" />Hapus</button>}
            </>}
          </div>
        </article>;
      }) : filtered ? <div><Empty title="Tidak ada event yang sesuai" description="Coba nama atau status publikasi lain." /><div className="mt-4 text-center"><button className="flow-button secondary" onClick={reset}>Hapus filter</button></div></div> : trash ? <Empty title="Sampah kosong" description="Event yang dihapus akan muncul di sini dan dapat dipulihkan sebagai draf." /> : <Empty title="Belum ada event" description="Mulai dengan menyiapkan program pertama Anda." href="/admin/events/new" label="Buat event" />}
    </Panel>
    <Dialog.Root open={isSuper && !!target} onOpenChange={open => { if (!open && !saving) { setTarget(null); setFailed(false); } }}><Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <Dialog.Content role="alertdialog" onEscapeKeyDown={event => { if (saving) event.preventDefault(); }} onPointerDownOutside={event => event.preventDefault()} onCloseAutoFocus={event => { event.preventDefault(); search.current?.focus(); }} className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 sm:p-8">
        <Dialog.Title className="text-xl font-semibold">{target?.restore ? "Pulihkan event?" : "Hapus event?"}</Dialog.Title>
        <Dialog.Description className="mt-3 break-words text-sm leading-7 text-content-body">{target?.event.title}</Dialog.Description>
        <p className="mt-3 text-sm leading-7 text-content-muted">{target?.restore ? "Event dikembalikan sebagai draf dengan pendaftaran tertutup. Periksa pengaturannya sebelum menayangkan kembali." : protectedEvent ? "Event ini memiliki pendaftaran dan tidak dapat dihapus. Gunakan Jadikan draf untuk menghentikan publikasi; riwayat peserta, transaksi, dan sertifikat tetap tersimpan." : "Event akan hilang dari daftar aktif dan halaman publik. Super admin dapat memulihkannya melalui Sampah."}</p>
        {failed && <p role="alert" className="flow-alert danger mt-4">{error || "Perubahan belum tersimpan. Silakan coba lagi."}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" disabled={saving} className="flow-button secondary" onClick={() => setTarget(null)}>{protectedEvent && !target?.restore ? "Tutup" : "Batal"}</button>{(!protectedEvent || target?.restore) && <button type="button" disabled={saving} className="flow-button" onClick={() => void confirm()}>{saving ? "Menyimpan…" : target?.restore ? "Pulihkan sebagai draf" : "Pindahkan ke Sampah"}</button>}</div>
      </Dialog.Content>
    </Dialog.Portal></Dialog.Root>
  </div>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ClipboardCheck, CreditCard, FilePenLine, Users, WalletCards } from "lucide-react";
import { EventCover } from "@/components/events/event-cover";
import { usePlatform } from "@/components/platform/provider";
import { Badge, Empty, Field, PageHeading, Panel, exportCsv } from "@/components/platform/ui";
import { money, paymentLabels, type PaymentStatus } from "@/lib/platform-model";

const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

function tone(status: PaymentStatus) {
  if (status === "paid") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "failed" || status === "expired") return "danger" as const;
  return "neutral" as const;
}

export function AdminOverview({ reports = false }: { reports?: boolean }) {
  const { state, error, refresh } = usePlatform();
  const [period, setPeriod] = useState("all");
  const start = new Date();
  start.setMonth(start.getMonth() - Number(period));
  const rows = state.registrations
    .filter(registration => !registration.orderId && (period === "all" || new Date(registration.createdAt) >= start))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const enrollments = state.registrations.filter(registration => period === "all" || new Date(registration.createdAt) >= start);
  const paid = rows.filter(registration => registration.payment === "paid");
  const events = state.events.filter(event => event.lifecycle !== "completed")
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)).slice(0, 4);
  const pending = rows.filter(registration => registration.payment === "pending").length;
  const drafts = state.events.filter(event => event.publication === "draft").length;
  const stats = [
    { label: "Event tayang", value: state.events.filter(event => event.publication === "published").length, hint: "Terlihat di katalog publik", Icon: CalendarDays },
    { label: "Peserta terdaftar", value: enrollments.filter(registration => registration.payment === "paid").length, hint: "Pendaftaran berstatus lunas", Icon: Users },
    { label: "Pendapatan", value: money(paid.reduce((sum, registration) => sum + registration.amount - registration.refund, 0)), hint: "Pembayaran lunas, setelah refund", Icon: WalletCards },
    { label: "Kehadiran", value: enrollments.filter(registration => registration.progress.attendance).length, hint: "Peserta yang tercatat hadir", Icon: ClipboardCheck },
  ];

  if (error) return <Panel><div role="alert"><h1 className="text-xl font-semibold">Ringkasan belum dapat dimuat</h1><p className="mt-3 text-sm text-content-muted">Muat ulang data untuk melihat ringkasan terbaru.</p><button className="flow-button mt-5" onClick={() => void refresh()}>Muat ulang data</button></div></Panel>;

  return <div>
    <PageHeading title={reports ? "Laporan" : "Ringkasan"} action={reports ?
      <button className="flow-button secondary" disabled={!rows.length} onClick={() => exportCsv("laporan-event", ["Pendaftaran", "Event", "Peserta", "Jumlah", "Status"], rows.map(registration => [registration.id, state.events.find(event => event.slug === registration.eventSlug)?.title || registration.eventSlug, registration.name, registration.amount, paymentLabels[registration.payment]]))}>Ekspor CSV</button> :
      <Link href="/admin/events/new" className="flow-button">Buat event</Link>} />

    {reports && <div className="mb-6 max-w-xs"><Field label="Periode laporan"><select value={period} onChange={event => setPeriod(event.target.value)}><option value="all">Semua waktu</option><option value="1">Sebulan terakhir</option><option value="3">3 bulan terakhir</option><option value="6">6 bulan terakhir</option></select></Field></div>}

    <div className={`workspace-overview ${reports ? "workspace-overview--report" : ""}`}>
      <section className="flow-panel workspace-summary" aria-labelledby="overview-summary-heading">
        <header className="workspace-panel-heading"><h2 id="overview-summary-heading">Ringkasan operasional</h2><span>{reports && period !== "all" ? `${period} bulan terakhir` : "Semua waktu"}</span></header>
        <dl className="workspace-metrics">{stats.map(({ label, value, hint, Icon }) => <div key={label}><dt><Icon size={17} aria-hidden="true" />{label}</dt><dd>{value}<small>{hint}</small></dd></div>)}</dl>
        {!reports && <nav className="workspace-quick-actions" aria-label="Antrean operasional">
          <Link href="/admin/events"><FilePenLine size={18} aria-hidden="true" /><span>Event dalam draf</span><strong>{drafts}</strong></Link>
          <Link href="/admin/payments"><CreditCard size={18} aria-hidden="true" /><span>Menunggu pembayaran</span><strong>{pending}</strong></Link>
          <Link href="/admin/operations/participants"><Users size={18} aria-hidden="true" /><span>Kelola peserta</span></Link>
        </nav>}
      </section>

      <Panel className="workspace-agenda"><div className="admin-section-title"><h2>Agenda mendatang</h2><Link href="/admin/events">Semua event</Link></div>
        {events.length ? <div className="admin-agenda">{events.map(event => <Link href={`/admin/events/${event.slug}`} key={event.id}>
          <div className="workspace-agenda-cover"><EventCover event={event} sizes="64px" /></div>
          <div className="admin-agenda-copy"><strong>{event.title}</strong><small><CalendarDays size={12} className="mr-1 inline" aria-hidden="true" />{new Date(event.startAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" })} · {time.format(new Date(event.startAt))} WIB</small><span className="mt-2 inline-block"><Badge tone={event.publication === "published" ? "success" : "neutral"}>{event.publication === "published" ? "Tayang" : "Draf"}</Badge></span></div>
        </Link>)}</div> : <Empty title="Belum ada agenda mendatang" description="Program berikutnya akan muncul setelah event dibuat." href={reports ? "/admin/events/new" : undefined} label="Buat event" />}
      </Panel>

      <Panel className="workspace-transactions"><div className="admin-section-title"><h2>{reports ? "Pendaftaran" : "Transaksi terbaru"}</h2><Link href="/admin/payments">Semua transaksi</Link></div>
        {rows.length ? <div className="flow-table-wrap"><table className="flow-table"><caption className="sr-only">{reports ? "Pendaftaran dalam periode laporan" : "Lima transaksi terbaru"}</caption><thead><tr><th scope="col">Peserta</th><th scope="col">Event</th><th scope="col">Jumlah</th><th scope="col">Status</th></tr></thead><tbody>{rows.slice(0, reports ? 100 : 5).map(registration => <tr key={registration.id}><td>{registration.name}<small>{registration.ticketName}</small></td><td>{state.events.find(event => event.slug === registration.eventSlug)?.title || registration.eventSlug}</td><td>{money(registration.amount)}</td><td><Badge tone={tone(registration.payment)}>{paymentLabels[registration.payment]}</Badge></td></tr>)}</tbody></table></div> : <Empty title={period === "all" ? "Belum ada transaksi" : "Tidak ada transaksi pada periode ini"} description={period === "all" ? "Pendaftaran peserta akan tercatat di sini." : "Pilih periode lain untuk melihat pendaftaran."} />}
      </Panel>
    </div>
  </div>;
}

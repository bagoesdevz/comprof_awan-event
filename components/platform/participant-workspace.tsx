"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Award, Bell, CalendarDays } from "lucide-react";
import { usePlatform } from "./provider";
import { Badge, Empty, PageHeading, Panel, exportCsv } from "./ui";
import { defaultProfile, eligible, lifecycleLabels, money, nextAction, paymentLabels, type ManagedEvent, type Registration } from "@/lib/platform-model";
import { eventVisual } from "@/lib/event-detail";
import { EligibilityPanel } from "@/components/dashboard/eligibility-panel";

function RecommendationCard({ event }: { event: ManagedEvent }) {
  const visual = eventVisual(event);

  return (
    <article className="group overflow-hidden rounded-2xl border border-content-title/10 bg-white shadow-[0_12px_34px_-24px_rgba(33,16,82,.34)] transition-colors hover:border-primary-400/60">
      {visual && (
        <div className="relative aspect-[16/8.5] overflow-hidden bg-primary-100">
          <Image
            src={visual.src}
            alt=""
            fill
            sizes="(max-width: 767px) calc(100vw - 32px), 450px"
            className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary-950/60 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <Badge>{event.programType}</Badge>
            <Badge>{event.type === "ONLINE" ? "Online" : event.type === "ONSITE" ? "Offline" : "Hybrid"}</Badge>
          </div>
          {visual.illustrative && <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-content-muted shadow-sm">Foto ilustratif</span>}
        </div>
      )}
      <div className="p-5 sm:p-6">
        {!visual && <div className="mb-4 flex flex-wrap gap-2"><Badge>{event.programType}</Badge><Badge>{event.type === "ONLINE" ? "Online" : event.type === "ONSITE" ? "Offline" : "Hybrid"}</Badge></div>}
        <h3 className="text-xl font-semibold leading-tight tracking-[-.025em]">{event.title}</h3>
        <p className="mb-5 mt-3 text-sm leading-6 text-content-muted">{event.category} · Mulai {new Date(event.startAt).toLocaleDateString("id-ID")} · {money(event.price)}</p>
        <Link className="flow-button" href={`/events/${event.slug}`}>Pelajari program</Link>
      </div>
    </article>
  );
}

export function ParticipantWorkspace({ view = "dashboard", slug }: { view?: string; slug?: string }) {
  const { state, ready, update } = usePlatform();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const profile = state.profiles[state.session.email] || defaultProfile;
  const registrations = state.registrations.filter(registration => registration.email === state.session.email);
  const registration = slug ? registrations.find(item => item.eventSlug === slug) : registrations.find(item => !eligible(item)) || registrations[0];
  const event = state.events.find(item => item.slug === registration?.eventSlug);
  const action = registration && event ? nextAction(registration, event) : null;
  const notifications = state.notices.filter(notice => notice.email === state.session.email);
  const completedRegistrations = registrations.filter(item => state.events.find(eventItem => eventItem.slug === item.eventSlug)?.lifecycle === "completed");
  const recommendations = state.events.filter(item => item.publication === "published" && item.lifecycle === "upcoming" && !registrations.some(itemRegistration => itemRegistration.eventSlug === item.slug)).sort((a, b) => Number(b.category === profile.specialization) - Number(a.category === profile.specialization));

  function eventRow(item: Registration) {
    const eventItem = state.events.find(eventValue => eventValue.slug === item.eventSlug);
    if (!eventItem) return null;
    const next = nextAction(item, eventItem);
    return <article key={item.id} className="flow-panel"><div className="flex flex-wrap gap-2"><Badge>{eventItem.programType}</Badge><Badge>{item.attendance === "ONLINE" ? "Online" : "Offline"}</Badge><Badge tone={item.payment === "paid" ? "success" : "warning"}>{paymentLabels[item.payment]}</Badge></div><h2 className="mt-5 text-2xl font-semibold leading-tight tracking-tight">{eventItem.title}</h2><p className="my-4 text-sm text-content-muted">{new Date(eventItem.startAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} · {item.ticketName}</p><div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5"><Link className="flow-button" href={`/dashboard/events/${eventItem.slug}`}>Buka event</Link><span className="text-xs text-content-muted">{next.label} · {Object.values(item.progress).filter(Boolean).length}/4 syarat</span></div></article>;
  }

  function dashboard() {
    return <div className="mx-auto max-w-6xl">
      <PageHeading eyebrow="Dashboard peserta" title={`Halo, ${profile.name.split(" ")[0] || "selamat datang"}.`} description="" action={<Link href="/events" className="flow-button secondary">Jelajahi event</Link>} />
      <section className="mt-8 grid gap-5 xl:grid-cols-[1.25fr_.75fr]" aria-label="Aktivitas utama peserta">
        {action && registration && event ? <article className="relative overflow-hidden rounded-[28px_28px_28px_8px] bg-primary-950 p-7 text-white sm:p-10"><span className="font-mono text-[10px] uppercase tracking-widest text-primary-400">Langkah berikutnya</span><h2 className="mt-5 text-[clamp(32px,4vw,52px)] font-semibold leading-tight tracking-tight">{action.label}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/65">{action.note}</p><Link href={action.href} className="flow-button secondary mt-7">{action.label}</Link></article> : <div className="rounded-[28px_28px_28px_8px] bg-primary-950 p-7 text-white sm:p-10"><span className="font-mono text-[10px] uppercase tracking-widest text-primary-400">Mulai dari sini</span><h2 className="mt-5 text-4xl font-semibold tracking-tight">Temukan event yang sesuai.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/65">Pilih webinar atau seminar untuk memulai perjalanan belajar dan mendapatkan sertifikat.</p><Link href="/events" className="flow-button secondary mt-7">Lihat event</Link></div>}
        <EligibilityPanel registration={registration} />
      </section>

      <section className="mt-9" aria-labelledby="participant-events-title"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 id="participant-events-title" className="mt-2 text-2xl font-semibold tracking-tight">Event saya</h2></div><Link href="/dashboard/events" className="text-sm font-semibold text-primary-600">Lihat semua <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div>{registrations.length ? <div className="grid gap-5 md:grid-cols-2">{registrations.map(eventRow)}</div> : <Empty title="Belum ada event yang diikuti" description="Pilih webinar atau seminar untuk memulai perjalanan belajarmu." href="/events" />}</section>

      <section className="mt-9 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" aria-label="Riwayat peserta">
        <Panel className="min-w-0 overflow-hidden" title="Riwayat event" extra={<Link href="/dashboard/history" className="text-xs font-semibold text-primary-600">Lihat semua</Link>}><div className="grid min-w-0 gap-3">{completedRegistrations.length ? completedRegistrations.map(item => { const eventItem = state.events.find(eventValue => eventValue.slug === item.eventSlug); return eventItem ? <Link key={item.id} href={`/dashboard/events/${eventItem.slug}`} className="flex min-w-0 max-w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border border-content-title/10 p-4 transition hover:border-primary-400 hover:bg-primary-100/40"><div className="min-w-0"><strong className="block truncate text-sm">{eventItem.title}</strong><span className="mt-1 block text-xs text-content-muted">{eventItem.programType} · {new Date(eventItem.startAt).toLocaleDateString("id-ID")}</span></div><Badge tone="success">Selesai</Badge></Link> : null; }) : <p className="text-sm text-content-muted">Belum ada event yang selesai diikuti.</p>}</div></Panel>
        <Panel className="min-w-0 overflow-hidden" title="Riwayat pembayaran" extra={<Link href="/dashboard/payments" className="text-xs font-semibold text-primary-600">Lihat semua</Link>}><div className="grid min-w-0 gap-3">{registrations.length ? registrations.slice(0, 3).map(item => { const eventItem = state.events.find(eventValue => eventValue.slug === item.eventSlug); return <div key={item.id} className="flex min-w-0 max-w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border border-content-title/10 p-4"><div className="min-w-0"><strong className="block truncate text-sm">{eventItem?.title || item.eventSlug}</strong><span className="mt-1 block text-xs text-content-muted">{item.id} · {money(item.amount)}</span></div><Badge tone={item.payment === "paid" ? "success" : "warning"}>{paymentLabels[item.payment]}</Badge></div>; }) : <p className="text-sm text-content-muted">Belum ada riwayat pembayaran.</p>}</div></Panel>
      </section>

      <section className="mt-9" aria-labelledby="recommendations-title"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 id="recommendations-title" className="mt-2 text-2xl font-semibold tracking-tight">Rekomendasi event</h2></div><Link href="/dashboard/recommendations" className="text-sm font-semibold text-primary-600">Lihat semua <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" /></Link></div>{recommendations.length ? <div className="grid gap-5 md:grid-cols-2">{recommendations.slice(0, 4).map(item => <RecommendationCard key={item.slug} event={item} />)}</div> : <Empty title="Belum ada rekomendasi baru" description="Semua event yang tersedia sudah ada di perjalananmu." href="/events" />}</section>
    </div>;
  }

  if (!ready) return <p role="status">Menyiapkan dashboard…</p>;
  if (slug && (!registration || !event)) return <Empty title="Kamu belum terdaftar di event ini" href={`/events/${slug}`} label="Lihat detail dan daftar" />;
  if (view === "notifications") return <div><PageHeading eyebrow="Dashboard / Notifikasi" title="Notifikasi" description="" action={<button className="flow-button secondary" onClick={() => update(stateValue => stateValue.notices.forEach(notice => { if (notice.email === stateValue.session.email) notice.read = true; }))}>Tandai semua dibaca</button>} /><div className="flow-tabs">{["all", "unread"].map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "Semua" : "Belum dibaca"}</button>)}</div><div className="grid gap-3">{notifications.filter(notice => filter !== "unread" || !notice.read).map(notice => <Link key={notice.id} href={notice.href} onClick={() => update(stateValue => { const current = stateValue.notices.find(item => item.id === notice.id); if (current) current.read = true; })} className={`flow-panel flex gap-4 ${!notice.read ? "border-primary-400" : ""}`}><Bell className="shrink-0 text-primary-600" size={22} /><div><strong>{notice.title}</strong><p className="mt-2 text-sm text-content-muted">{notice.body}</p><small className="mt-3 block text-content-muted">{new Date(notice.createdAt).toLocaleString("id-ID")}</small></div>{!notice.read && <Badge>Baru</Badge>}</Link>)}</div>{!notifications.some(notice => filter !== "unread" || !notice.read) && <Empty title="Semua sudah terbaca" description="Pengingat baru akan muncul di sini." />}</div>;
  if (view === "payments") return <div><PageHeading eyebrow="Dashboard / Riwayat pembayaran" title="Pembayaran" description="" action={<button className="flow-button secondary" onClick={() => exportCsv("riwayat-pembayaran", ["Order", "Event", "Status", "Jumlah"], registrations.map(item => [item.id, item.eventSlug, item.payment, item.amount]))}>Ekspor riwayat</button>} /><Panel><div className="flow-table-wrap"><table className="flow-table"><thead><tr>{["Invoice", "Event / tiket", "Jumlah", "Status", "Tindakan"].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{registrations.map(item => <tr key={item.id}><td>{item.id}<small>{new Date(item.createdAt).toLocaleDateString("id-ID")}</small></td><td>{state.events.find(eventItem => eventItem.slug === item.eventSlug)?.title}<small>{item.ticketName}</small></td><td>{money(item.amount)}</td><td><Badge tone={item.payment === "paid" ? "success" : "warning"}>{paymentLabels[item.payment]}</Badge></td><td><Link className="flow-button secondary" href={`/events/${item.eventSlug}/payment?registration=${item.id}&ticket=${item.ticketId}`}>Lihat transaksi</Link></td></tr>)}</tbody></table></div>{!registrations.length && <Empty title="Belum ada transaksi" href="/events" />}</Panel></div>;
  if (view === "recommendations") return <div><PageHeading eyebrow="Dashboard / Rekomendasi" title="Rekomendasi event"  /><div className="grid gap-5 md:grid-cols-2">{recommendations.map(item => <RecommendationCard key={item.slug} event={item} />)}</div></div>;
  if (view === "events" || view === "history") return <div><PageHeading eyebrow={`Dashboard / ${view === "history" ? "Riwayat event" : "Event saya"}`} title={view === "history" ? "Riwayat event" : "Event saya"} /><label className="mb-6 block"><span className="sr-only">Cari event saya</span><input className="flow-input" type="search" placeholder="Cari event yang kamu ikuti" value={query} onChange={eventValue => setQuery(eventValue.target.value)} /></label><div className="grid gap-5">{registrations.filter(item => (view !== "history" || state.events.find(eventItem => eventItem.slug === item.eventSlug)?.lifecycle === "completed") && (state.events.find(eventItem => eventItem.slug === item.eventSlug)?.title || "").toLowerCase().includes(query.toLowerCase())).map(eventRow)}</div>{!registrations.length && <Empty title="Belum ada event" href="/events" />}</div>;
  if (slug && registration && event) return <div className="mx-auto max-w-6xl"><PageHeading eyebrow="Event saya / Perjalanan peserta" title={event.title} description={`${event.duration} · ${registration.ticketName}`} action={<Link href="/events" className="flow-button secondary">Jelajahi event</Link>} />{action ? <><section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_.6fr]"><article className="relative overflow-hidden rounded-[28px_28px_28px_8px] bg-primary-950 p-7 text-white sm:p-10"><span className="font-mono text-[10px] uppercase tracking-widest text-primary-400">Langkah berikutnya</span><h2 className="mt-5 text-[clamp(32px,4vw,52px)] font-semibold leading-tight tracking-tight">{action.label}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/65">{action.note}</p><Link href={action.href} className="flow-button secondary mt-7">{action.label}</Link></article><Panel title="Keikutsertaan"><Badge tone={registration.payment === "paid" ? "success" : "warning"}>{paymentLabels[registration.payment]}</Badge><p className="mt-5 text-sm font-semibold">{event.title}</p><p className="mt-3 flex gap-2 text-xs text-content-muted"><CalendarDays size={16} />{new Date(event.startAt).toLocaleDateString("id-ID")} · {lifecycleLabels[event.lifecycle]}</p><p className="mt-3 text-xs text-content-muted">{registration.id}</p></Panel></section><div className="mt-5 grid gap-5 xl:grid-cols-2"><EligibilityPanel registration={registration} /><Panel title="Aktivitas event"><div className="grid gap-2">{[["pre-test", "Pre-test"], ["webinar", `${event.meetingProvider} / akses event`], ["attendance", "Kehadiran"], ["post-test", "Post-test"], ["feedback", "Feedback"]].map(([key, label]) => <Link className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-content-title/10 px-4 py-3 text-sm hover:bg-primary-100" key={key} href={`/dashboard/events/${event.slug}/${key}`}>{label}<ArrowRight size={16} /></Link>)}<Link className="flow-button secondary mt-3" href="/dashboard/certificates"><Award size={17} />Sertifikat</Link></div></Panel></div></> : <EligibilityPanel registration={registration} />}</div>;
  return dashboard();
}

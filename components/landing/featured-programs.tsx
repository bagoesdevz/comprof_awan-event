"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { eventPrice } from "@/lib/event-detail";
import { EventCover } from "@/components/events/event-cover";
import { eventPublicPath } from "@/lib/event-sharing";

const date = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function FeaturedPrograms() {
  const { state, ready, error, refresh } = usePlatform();
  const events = state.events.filter(event => event.publication === "published" && event.lifecycle !== "completed").slice(0, 3);
  if (error) return <div className="program-state" role="alert"><CalendarDays size={28} aria-hidden="true" /><div><h3>Jadwal belum dapat dimuat</h3><p>Coba muat ulang untuk melihat event yang tersedia.</p></div><button type="button" className="brand-button" onClick={() => void refresh()}>Muat ulang jadwal</button></div>;
  if (!ready) return <div className="program-state" role="status" aria-busy="true"><CalendarDays size={28} aria-hidden="true" /><p>Memuat jadwal event…</p></div>;
  if (!events.length) return <div className="program-state"><CalendarDays size={28} aria-hidden="true" /><div><h3>Belum ada event mendatang</h3><p>Lihat katalog untuk meninjau program yang tersedia.</p></div><Link href="/events" className="brand-button">Buka katalog event</Link></div>;
  return <div className={`featured-program-grid ${events.length === 1 ? "featured-program-grid--single" : ""}`}>{events.map(event => {
    const price=eventPrice(event);
    return <article key={event.slug} className="program-card">
    <Link href={eventPublicPath(event)} className="program-card-image" tabIndex={-1} aria-hidden="true"><EventCover event={event} sizes="(max-width: 760px) 90vw, 50vw" /><span>{event.programType}</span></Link>
    <div className="program-card-copy"><span className="brand-eyebrow">{event.category}</span><h3><Link href={eventPublicPath(event)}>{event.title}</Link></h3><p className="program-card-meta"><span><CalendarDays size={14} aria-hidden="true" />{date.format(new Date(event.startAt))}</span><span><MapPin size={14} aria-hidden="true" />{event.type === "ONLINE" ? "Online" : event.city}</span></p><div className="program-card-bottom"><div><small>{price===null?"Tiket":"Mulai dari"}</small><strong>{price===null?"Belum tersedia":price === 0 ? "Gratis" : money.format(price)}</strong></div><Link className="program-card-action" href={eventPublicPath(event)}>Lihat program</Link></div></div>
  </article>;})}</div>;
}

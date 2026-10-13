"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { eventPrice, eventVisual } from "@/lib/event-detail";

const date = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function FeaturedPrograms() {
  const { state } = usePlatform();
  const events = state.events.filter(event => event.publication === "published" && event.lifecycle !== "completed").slice(0, 3);
  return <div className="featured-program-grid">{events.length ? events.map(event => {
    const visual=eventVisual(event,event.blocks.find(block=>block.type==="Hero"));
    const price=eventPrice(event);
    return <article key={event.slug} className="program-card">
    <Link href={`/events/${event.slug}`} className="program-card-image" tabIndex={-1} aria-hidden="true"><Image src={visual?.src||"/awan-event-logo.jpeg"} unoptimized alt="" fill sizes="(max-width: 760px) 90vw, 390px" /><span>{event.programType}</span></Link>
    <div className="program-card-copy"><span className="brand-eyebrow">{event.category}</span><h3><Link href={`/events/${event.slug}`}>{event.title}</Link></h3><p className="program-card-meta"><span><CalendarDays size={14} aria-hidden="true" />{date.format(new Date(event.startAt))}</span><span><MapPin size={14} aria-hidden="true" />{event.type === "ONLINE" ? "Online" : event.city}</span></p><div className="program-card-bottom"><div><small>{price===null?"Tiket":"Mulai dari"}</small><strong>{price===null?"Belum tersedia":price === 0 ? "Gratis" : money.format(price)}</strong></div><Link className="program-card-action" href={`/events/${event.slug}`}>Lihat program</Link></div></div>
  </article>;}) : <div className="flow-empty"><h3>Program baru sedang disiapkan</h3><p>Pantau jadwal event untuk menemukan kesempatan belajar berikutnya.</p><Link href="/events" className="brand-text-link">Lihat jadwal <ArrowRight size={16} /></Link></div>}</div>;
}

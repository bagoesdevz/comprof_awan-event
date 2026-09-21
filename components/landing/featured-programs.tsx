"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";

const date = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const photos = [
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=720&q=80",
];

export function FeaturedPrograms() {
  const { state } = usePlatform();
  const events = state.events.filter(event => event.publication === "published" && event.lifecycle !== "completed").slice(0, 3);
  return <div className="featured-program-grid">{events.length ? events.map((event, index) => <article key={event.slug} className="program-card">
    <Link href={`/events/${event.slug}`} className="program-card-image" tabIndex={-1} aria-hidden="true"><Image src={photos[index]} alt="" fill sizes="(max-width: 760px) 90vw, 390px" /><span>{event.programType}</span></Link>
    <div className="program-card-copy"><span className="brand-eyebrow">{event.category}</span><h3><Link href={`/events/${event.slug}`}>{event.title}</Link></h3><p className="program-card-meta"><span><CalendarDays size={14} aria-hidden="true" />{date.format(new Date(event.startAt))}</span><span><MapPin size={14} aria-hidden="true" />{event.type === "ONLINE" ? "Online" : event.city}</span></p><div className="program-card-bottom"><div><small>Mulai dari</small><strong>{event.price === 0 ? "Gratis" : money.format(event.price)}</strong></div><Link className="program-card-action" href={`/events/${event.slug}`}>Lihat program</Link></div></div>
  </article>) : <div className="flow-empty"><h3>Program baru sedang disiapkan</h3><p>Pantau jadwal event untuk menemukan kesempatan belajar berikutnya.</p><Link href="/events" className="brand-text-link">Lihat jadwal <ArrowRight size={16} /></Link></div>}</div>;
}

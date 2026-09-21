"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import type { ManagedEvent } from "@/lib/platform-model";
import { ticketState } from "@/lib/event-detail";

export function EventAction({ event, ticketId, className = "brand-button", now = Date.now() }: { event: ManagedEvent; ticketId?: string; className?: string; now?: number }) {
  const { state } = usePlatform();
  const ticket = event.tickets.find(item => item.id === ticketId);
  const registration = state.session.loggedIn ? state.registrations.find(item => item.eventSlug === event.slug && item.email === state.session.email && !["cancelled", "refunded"].includes(item.payment)) : undefined;
  const loginOr = (path: string) => state.session.loggedIn ? path : "/login?next=" + encodeURIComponent(path);
  const registrationPath = `/events/${event.slug}/register` + (ticket ? `?ticket=${encodeURIComponent(ticket.id)}` : "");
  let href = loginOr(registrationPath);
  let label = "Daftar sekarang";
  let disabled = "";

  if (event.lifecycle === "completed") disabled = "Event selesai";
  else if (registration) {
    href = registration.payment === "paid" ? `/dashboard/events/${event.slug}` : `/events/${event.slug}/payment?registration=${registration.id}&ticket=${registration.ticketId}`;
    label = registration.payment === "paid" ? event.lifecycle === "ongoing" ? "Masuk ke event" : "Buka event saya" : "Lanjutkan pembayaran";
  } else if (event.lifecycle === "ongoing") {
    href = loginOr(`/dashboard/events/${event.slug}`);
    label = "Masuk ke event";
  } else if (ticketId && !ticket) disabled = "Tiket tidak tersedia";
  else {
    const statuses = ticket ? [ticketState(event, ticket, now)] : event.tickets.map(item => ticketState(event, item, now));
    if (!statuses.length) disabled = "Tiket segera tersedia";
    else if (!statuses.includes("available")) {
      if (statuses.includes("full") && event.waitlist) {
        href = `/waitlist/${event.slug}` + (ticket ? `?ticket=${encodeURIComponent(ticket.id)}` : "");
        label = "Gabung daftar tunggu";
      } else disabled = statuses.includes("scheduled") ? "Pendaftaran segera dibuka" : statuses.includes("full") ? "Kuota penuh" : "Pendaftaran ditutup";
    }
    else if (ticket ? ticket.price === 0 : event.tickets.some(item => item.price === 0)) label = ticket ? "Daftar gratis" : "Lihat tiket";
  }

  return disabled ? <button type="button" disabled className={className}>{disabled}</button> : (
    <Link className={className} href={href} aria-label={ticket ? `${label} · ${ticket.name}` : undefined}>{label}<ArrowRight size={16} aria-hidden="true" /></Link>
  );
}

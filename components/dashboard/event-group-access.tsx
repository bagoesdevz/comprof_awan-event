"use client";

import { MessageCircle } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { Panel } from "@/components/platform/ui";
import { whatsappGroupLink } from "@/lib/event-sharing";

export function EventGroupAccess({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const { state, ready } = usePlatform();
  const registered = state.session.loggedIn && state.registrations.some(registration =>
    registration.eventSlug === slug && registration.email.toLowerCase() === state.session.email.toLowerCase() && !["cancelled", "expired", "refunded"].includes(registration.payment)
  );
  const url = whatsappGroupLink(state.events.find(event => event.slug === slug)?.whatsappGroupUrl);
  if (!ready || !registered) return null;
  const link = url ? <a href={url} target="_blank" rel="noopener noreferrer" className="flow-button secondary"><MessageCircle size={18} aria-hidden="true" />Gabung grup WhatsApp</a> : null;
  if (compact) return link;
  return <Panel title="Grup WhatsApp event" className="mt-6">
    <p className={"text-sm leading-7 text-content-body" + (url ? " mb-4" : "")}>{url ? "Buka grup penyelenggara untuk mengikuti informasi tentang event ini." : "Tautan grup belum ditambahkan oleh penyelenggara. Periksa kembali nanti."}</p>
    {link}
  </Panel>;
}

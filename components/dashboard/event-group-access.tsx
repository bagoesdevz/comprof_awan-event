"use client";

import { MessageCircle } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { Panel } from "@/components/platform/ui";
import { whatsappGroupLink } from "@/lib/event-sharing";

export function EventGroupAccess({ slug }: { slug: string }) {
  const { state, ready } = usePlatform();
  const registered = state.session.loggedIn && state.registrations.some(registration =>
    registration.eventSlug === slug && registration.email === state.session.email && !["cancelled", "expired", "refunded"].includes(registration.payment)
  );
  const url = whatsappGroupLink(state.events.find(event => event.slug === slug)?.whatsappGroupUrl);
  if (!ready || !registered || !url) return null;
  return <Panel title="Grup WhatsApp event" className="mx-auto mt-6 max-w-6xl">
    <p className="mb-4 text-sm leading-7 text-content-body">Buka grup penyelenggara untuk mengikuti informasi tentang event ini.</p>
    <a href={url} target="_blank" rel="noopener noreferrer" className="flow-button"><MessageCircle size={18} aria-hidden="true" />Gabung grup WhatsApp</a>
  </Panel>;
}

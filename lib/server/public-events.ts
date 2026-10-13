import "server-only";
import type { ManagedEvent } from "@/lib/platform-model";
import { liveEvent } from "./platform";

export function publicEventData(raw: ManagedEvent) {
  const event = liveEvent(raw);
  const prices = event.tickets.filter(ticket=>ticket.status!=="inactive").map(ticket=>ticket.price);
  return {
    id:event.id,slug:event.slug,title:event.title,summary:event.summary,description:event.description,
    category:event.category,event_type:event.type,city:event.city,venue:event.venue,venue_address:event.venueAddress,
    price:prices.length ? Math.min(...prices) : event.price,
    credits:event.credits,registration_status:event.registrationStatus,start_date:event.startAt,end_date:event.endAt,
    benefits:event.tickets.flatMap(t=>t.benefits),rundown:event.sessions,audience:event.audience,speakers:event.speakers,
  };
}

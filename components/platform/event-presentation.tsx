"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { usePlatform } from "./provider";
import { Empty } from "./ui";
import { attendanceOptions, blockTitle, eventAttendanceMode, presentationBlocks, type Attendance } from "@/lib/event-detail";
import type { Block, ManagedEvent } from "@/lib/platform-model";
import { EventAboutSection, EventAccessSection, EventAgendaSection, EventBenefitsSection, EventCountdownSection, EventFaqSection, EventFinalCta, EventHero, EventImage, EventPricingSection, EventSectionHeading, EventSpeakerSection } from "@/components/events/event-detail-sections";
export { EventAction } from "@/components/events/event-action";

const anchorFor: Record<string, string> = { Hero: "event-overview", Speaker: "event-speakers", About: "event-about", Benefits: "event-topics", Agenda: "event-agenda", Access: "event-access", Ticket: "tickets", Pricing: "tickets", FAQ: "event-faq", Countdown: "event-countdown", CTA: "event-register" };

function ExtraBlock({ event, block, id }: { event: ManagedEvent; block: Block; id: string }) {
  if (!block.body && !block.image && ["Partner", "Testimonial", "Image", "Video", "Gallery"].includes(block.type)) return null;
  return <section id={id} className="brand-container event-detail-section"><EventSectionHeading eyebrow={event.programType} title={block.title} />
    {block.image && <EventImage src={block.image} alt={block.title} className="event-content-image" />}
    {block.type === "Video" && /^https:\/\//.test(block.body) ? <a className="brand-button brand-button--outline" href={block.body} target="_blank" rel="noreferrer">Tonton video<ArrowRight size={16} aria-hidden="true" /></a> : block.type === "Testimonial" ? <blockquote className="event-block-copy">{block.body}</blockquote> : <p className="event-block-copy">{block.body}</p>}
  </section>;
}

function EventDetail({ event, participantCount }: { event: ManagedEvent; participantCount: number }) {
  const [attendance, setAttendance] = useState<Attendance>(() => eventAttendanceMode(event));
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const selectedAttendance = attendanceOptions(event).length === 1 ? eventAttendanceMode(event) : attendance;
  const blocks = presentationBlocks(event.blocks);
  // Legacy pages placed location outside the builder; keep it adjacent to the agenda.
  if (!event.blocks.some(block => block.type === "Access")) {
    const agenda = blocks.findIndex(block => block.type === "Agenda");
    if (agenda >= 0) blocks.splice(agenda + 1, 0, { id: "event-access-default", type: "Access", title: "Access", body: "", visible: true });
  }
  const ids = new Set<string>();
  const sections = blocks.map(block => {
    const anchor = anchorFor[block.type] || `event-block-${block.id}`;
    const id = ids.has(anchor) ? `${anchor}-${block.id}` : anchor;
    ids.add(id);
    return { block, id };
  });
  const ticketAnchor = sections.find(({ block }) => block.type === "Ticket" || block.type === "Pricing")?.id;
  const hasHero = blocks.some(block => block.type === "Hero");

  const template = event.programType.toLowerCase().includes("webinar") ? "webinar" : event.programType.toLowerCase().includes("seminar") ? "seminar" : event.programType.toLowerCase().includes("pelatihan") || event.programType.toLowerCase().includes("workshop") ? "pelatihan" : "default";

  return <div className={`event-detail-page event-template-${template}`}>
    <nav className="brand-container event-breadcrumb" aria-label="Breadcrumb"><Link href="/">Beranda</Link><ChevronRight size={13} aria-hidden="true" /><Link href="/events">Event</Link><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">{event.title}</span></nav>
    {!hasHero && <header className="brand-container event-no-hero"><span className="brand-eyebrow">{event.programType}</span><h1>{event.title}</h1></header>}
    {sections.map(({ block, id }) => {
      const props = { event, block, id };
      const attendanceProps = { attendance: selectedAttendance, onAttendanceChange: setAttendance };
      if (block.type === "Hero") return <EventHero key={block.id} {...props} participantCount={participantCount} ticketAnchor={ticketAnchor} />;
      if (block.type === "Speaker") return <EventSpeakerSection key={block.id} {...props} />;
      if (block.type === "About") return <EventAboutSection key={block.id} {...props} />;
      if (block.type === "Benefits") return <EventBenefitsSection key={block.id} {...props} />;
      if (block.type === "Agenda") return <EventAgendaSection key={block.id} {...props} />;
      if (block.type === "Access") return <EventAccessSection key={block.id} {...props} {...attendanceProps} />;
      if (block.type === "Ticket" || block.type === "Pricing") return <EventPricingSection key={block.id} {...props} {...attendanceProps} now={now} />;
      if (block.type === "Countdown") return <EventCountdownSection key={block.id} {...props} />;
      if (block.type === "FAQ") return <EventFaqSection key={block.id} {...props} {...attendanceProps} />;
      if (block.type === "CTA") return <EventFinalCta key={block.id} {...props} />;
      if (block.type === "Rich Text") return <section key={block.id} id={id} className="brand-container event-detail-section"><EventSectionHeading eyebrow={event.programType} title={blockTitle(block, "Informasi kegiatan")} /><p className="event-block-copy">{block.body || event.description}</p></section>;
      return <ExtraBlock key={block.id} {...props} />;
    })}
  </div>;
}

export function EventPresentation({ slug, previewEvent }: { slug: string; previewEvent?: ManagedEvent }) {
  const { state, ready } = usePlatform();
  const event = previewEvent || state.events.find(item => item.slug === slug);
  if (!ready && !previewEvent) return <div className="brand-container event-detail-loading" role="status" aria-label="Memuat detail event"><div /><div /><span className="sr-only">Memuat detail event…</span></div>;
  if (!event || (!previewEvent && event.publication !== "published")) return <div className="brand-container event-detail-section"><Empty title="Event belum tersedia" href="/events" /></div>;
  return <EventDetail key={event.slug} event={event} participantCount={state.participantCounts[event.slug] || 0} />;
}

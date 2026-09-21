"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, ExternalLink, GraduationCap, Headphones, MapPin, Target, Users, Video } from "lucide-react";
import { BrandSlogan, BrandWaves } from "@/components/brand/brand-elements";
import { EventAction } from "@/components/events/event-action";
import { attendanceLabels, attendanceOptions, blockTitle, eventAttendanceMode, eventDate, eventDateTime, eventFaq, eventVisual, participationSteps, ticketState, type Attendance } from "@/lib/event-detail";
import { eventTimeRange } from "@/lib/event-time";
import { lifecycleLabels, money, type Block, type ManagedEvent } from "@/lib/platform-model";

type SectionProps = { event: ManagedEvent; block: Block; id: string };
type AttendanceProps = { attendance: Attendance; onAttendanceChange: (attendance: Attendance) => void };
const defaultModerator: ManagedEvent["speakers"][number] = { photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=520&q=85", name: "Moderator Event", role: "Moderator", organization: "Awan Event Network", bio: "Memandu alur diskusi, tanya jawab, dan rangkuman sesi selama kegiatan." };

function eventSpeakerProfiles(event: ManagedEvent): ManagedEvent["speakers"] {
  const profiles = event.speakers.length ? event.speakers : [{ name: event.speaker, role: "Pembicara utama", organization: "Awan Event Network", bio: "Praktisi yang memfasilitasi sesi berbasis pengalaman dan studi kasus." }];
  return profiles.length === 1 ? [...profiles, defaultModerator] : profiles;
}

export function EventSectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <div className="event-section-heading"><div><span className="brand-eyebrow">{eyebrow}</span><h2>{title}</h2></div>{children && <p>{children}</p>}</div>;
}

export function EventImage({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return <div className={`event-image ${className}`}>{failed ? <span className="event-image-fallback">Gambar belum tersedia</span> : <Image src={src} alt={alt} fill unoptimized priority={priority} sizes="(max-width: 760px) 90vw, 560px" onError={() => setFailed(true)} />}</div>;
}

export function EventHero({ event, block, id, participantCount }: SectionProps & { participantCount: number }) {
  const visual = eventVisual(event, block);
  const joined = Math.max(0, participantCount);
  return <section id={id} className="event-detail-hero">
      <BrandWaves className="event-hero-waves" />
      <div className="brand-container event-hero-grid">
        <div className="event-hero-copy">
          <div className="event-labels"><span className="event-tag">{event.programType}</span><span className="event-format">{attendanceLabels[event.type]}</span><span className="event-lifecycle" data-status={event.lifecycle}>{lifecycleLabels[event.lifecycle]}</span></div>
          <h1>{event.title}</h1>
          <p className="event-hero-summary">{event.summary || event.description}</p>
          <dl className="event-hero-meta">
            <div><span className="event-hero-meta-icon"><CalendarDays aria-hidden="true" size={22} /></span><div><dt>Tanggal & waktu</dt><dd>{eventDate(event.startAt)}<small>{eventTimeRange(event.startAt, event.endAt)}</small></dd></div></div>
            <div><span className="event-hero-meta-icon">{event.type === "ONLINE" ? <Video aria-hidden="true" size={22} /> : <MapPin aria-hidden="true" size={22} />}</span><div><dt>{event.type === "ONLINE" ? "Platform" : "Lokasi kegiatan"}</dt><dd>{event.type === "ONLINE" ? `Online melalui ${event.meetingProvider}` : event.mapLabel || event.venue}<small>{event.type === "HYBRID" ? `Tersedia juga online melalui ${event.meetingProvider}` : event.type === "ONLINE" ? "Akses melalui dashboard peserta" : event.city}</small></dd></div></div>
          </dl>
          <div className="event-participant-proof">
            <div className="event-participant-avatars" aria-hidden="true"><span><Users size={18} /></span></div>
            <p><strong>{joined.toLocaleString("id-ID")} peserta</strong><span>terdaftar di event ini</span></p>
          </div>
        </div>
        <div className="event-hero-visual">
          <div className="event-hero-visual-heading"><span className="brand-eyebrow">Awan Event · {event.programType}</span><BrandSlogan /></div>
          {visual ? <EventImage src={visual.src} alt={visual.illustrative ? `Ilustrasi pembelajaran untuk ${event.title}` : `Poster ${event.title}`} className={visual.illustrative ? "event-hero-photo" : "event-hero-photo event-hero-photo--poster"} priority /> : <div className="event-hero-placeholder"><BrandWaves /><GraduationCap size={56} strokeWidth={1.3} aria-hidden="true" /><span>{event.programType}</span><strong>Ruang untuk belajar.<br />Kesempatan untuk bertumbuh.</strong></div>}
        </div>
      </div>
    </section>;
}

export function EventSpeakerSection({ event, id }: SectionProps) {
  const profiles = eventSpeakerProfiles(event);
  const hasExplicitModerator = profiles.some(speaker => /moderator/i.test(speaker.role));
  const entries = profiles.map((speaker, index) => ({ speaker, participationRole: /moderator/i.test(speaker.role) || (!hasExplicitModerator && profiles.length > 1 && index === profiles.length - 1) ? "Moderator" : "Speaker" }));
  return <section id={id} className="brand-container event-detail-section">
    <span className="brand-eyebrow">Speaker & moderator</span>
    {profiles.length ? <div className="event-speaker-columns">{(["Speaker", "Moderator"] as const).map(group => <div className="event-speaker-column" key={group}>
      <h2>{group === "Speaker" ? "Keynote Speaker" : "Moderator"}</h2>
      <div className="event-speaker-list">{entries.filter(entry => entry.participationRole === group).map(({ speaker, participationRole }) => <article className="event-speaker" key={speaker.name}>
          {speaker.photo ? <EventImage src={speaker.photo} alt={`Foto ilustrasi ${speaker.name}`} className="event-speaker-photo" /> : <div className="event-speaker-initials" aria-hidden="true">{speaker.name.replace(/^(dr\.|Ns\.|apt\.)\s*/i, "").split(" ").slice(0, 2).map(word => word[0]).join("")}</div>}
          <div className="event-speaker-copy"><span className="event-speaker-participation">{participationRole}</span><h3>{speaker.name}</h3><p className="event-speaker-role">{speaker.role}</p><p className="event-speaker-bio">{speaker.bio}</p><div className="event-speaker-meta"><span>{event.category}</span><span>{event.programType}</span></div><p className="event-speaker-org">{speaker.organization}</p></div>
        </article>)}</div>
    </div>)}</div> : <p className="event-empty">Profil speaker dan moderator akan diumumkan oleh penyelenggara.</p>}
  </section>;
}

export function EventAboutSection({ event, block, id }: SectionProps) {
  return <section id={id} className="brand-container event-detail-section event-about-grid">
    <div><span className="brand-eyebrow">Tentang {event.programType.toLowerCase()}</span><h2>{blockTitle(block, "Pembelajaran yang dekat dengan kebutuhan Anda.")}</h2><p className="event-about-copy">{block.body || event.description}</p></div>
    <aside className="event-audience"><div className="event-audience-heading"><span className="brand-icon"><Target size={28} aria-hidden="true" /></span><h3>Untuk siapa {event.programType.toLowerCase()} ini?</h3></div><p>{event.audience || "Informasi peserta yang dituju akan diumumkan oleh penyelenggara."}</p></aside>
  </section>;
}

export function EventBenefitsSection({ event, block, id }: SectionProps) {
  return <section id={id} className="event-detail-tint"><div className="brand-container event-detail-section">
    <EventSectionHeading eyebrow="Fokus pembelajaran" title={blockTitle(block, "Pengetahuan untuk langkah berikutnya.")}>Capaian yang menjadi fokus sesi, diskusi, dan pembahasan kasus dalam kegiatan ini.</EventSectionHeading>
    {block.body && <p className="event-block-copy">{block.body}</p>}
    {event.learningOutcomes.length ? <div className="event-outcomes">{event.learningOutcomes.map((outcome, index) => <article key={outcome}><span className="event-outcome-index">{String(index + 1).padStart(2, "0")}</span><h3>{outcome}</h3><span className="event-outcome-line" aria-hidden="true" /></article>)}</div> : <p className="event-empty">Topik pembelajaran sedang disiapkan.</p>}
  </div></section>;
}

export function EventAgendaSection({ event, id }: SectionProps) {
  return <section id={id} className="brand-container event-detail-section event-agenda-section">
    <h2>Rundown Kegiatan</h2>
    {event.sessions.length ? <ol className="event-agenda">{event.sessions.map((session, index) => <li key={`${session.time}-${index}`}><time>{session.time}</time><div><h3>{session.title}</h3><p>{session.note}</p></div></li>)}</ol> : <p className="event-empty">Susunan acara akan diumumkan sebelum kegiatan.</p>}
  </section>;
}

export function AttendanceSelector({ event, attendance, onAttendanceChange, label }: { event: ManagedEvent; label: string } & AttendanceProps) {
  if (attendanceOptions(event).length < 2) return null;
  return <div className="event-attendance-switch" role="group" aria-label={label}>{attendanceOptions(event).map(option => <button type="button" key={option} aria-pressed={attendance === option} onClick={() => onAttendanceChange(option)}>{option === "ONLINE" ? <Video size={16} aria-hidden="true" /> : <MapPin size={16} aria-hidden="true" />}{attendanceLabels[option]}</button>)}</div>;
}

export function EventAccessSection({ event, block, id, attendance, onAttendanceChange }: SectionProps & AttendanceProps) {
  const mode = attendanceOptions(event).length === 1 ? eventAttendanceMode(event) : attendance;
  const online = mode === "ONLINE";
  const selectable = attendanceOptions(event).length > 1;
  const platform = event.programType.toLowerCase() === "webinar" ? "Zoom" : event.meetingProvider;
  const location = event.mapLabel || event.venue;
  return <section id={id} className="brand-container event-detail-section">
    <EventSectionHeading eyebrow="Akses & alur kehadiran" title={blockTitle(block, online ? "Bergabung dari mana saja." : "Sampai bertemu di lokasi kegiatan.")}>{selectable ? "Pilih cara hadir untuk melihat petunjuk yang sesuai dengan tiket Anda." : online ? "Akses webinar tersedia melalui Zoom." : "Seminar berlangsung secara offline di lokasi kegiatan."}</EventSectionHeading>
    <AttendanceSelector event={event} attendance={attendance} onAttendanceChange={onAttendanceChange} label="Petunjuk kehadiran" />
    <div className="event-access-grid" data-attendance={mode}>
      <div className="event-access-place"><span className="brand-icon">{online ? <Video size={26} aria-hidden="true" /> : <MapPin size={26} aria-hidden="true" />}</span><span className="brand-eyebrow">{online ? "Akses online" : "Lokasi tatap muka"}</span><h3>{online ? platform : location || "Lokasi segera diumumkan"}</h3><p>{online ? "Selesaikan pembayaran dan pre-test. Buka akses sesi melalui dashboard saat kegiatan dimulai." : event.venueAddress || event.city}</p>{!online && location && <a className="brand-text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([location, event.venueAddress, event.city].filter(Boolean).join(" "))}`} target="_blank" rel="noreferrer">Buka Google Maps<ExternalLink size={15} aria-hidden="true" /></a>}<p className="event-section-note">{online ? "Siapkan perangkat, koneksi internet, dan audio yang memadai." : "Siapkan tiket QR dan identitas sesuai data pendaftaran untuk check-in."}</p></div>
      <ol className="event-journey">{participationSteps(event, mode).map(step => <li key={step.title}><span className="event-journey-dot" aria-hidden="true" /><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
    </div>
  </section>;
}

const ticketStatusLabels = { available: "Tersedia", full: "Kuota penuh", scheduled: "Segera dibuka", expired: "Periode berakhir", closed: "Tidak tersedia", completed: "Event selesai" };
export function EventPricingSection({ event, id, attendance, onAttendanceChange, now }: SectionProps & AttendanceProps & { now: number }) {
  const attendanceTickets = event.tickets.filter(ticket => ticket.attendance === attendance);
  const tickets = attendanceTickets;
  return <section id={id} className="event-detail-tint"><div className="brand-container event-detail-section">
    <div className="event-pricing-heading"><h2>Pilih Tiket Anda</h2></div>
    <AttendanceSelector event={event} attendance={attendance} onAttendanceChange={onAttendanceChange} label="Filter tiket berdasarkan kehadiran" />
    <div className="event-ticket-grid">{tickets.length ? tickets.map(ticket => {
        const status = ticketState(event, ticket, now);
        return <article className="event-ticket" key={ticket.id} data-ticket-status={status}>
          <div className="event-ticket-top"><span className="event-format">{attendanceLabels[ticket.attendance]}</span><span className="event-ticket-status" data-status={status}>{ticketStatusLabels[status]}</span></div>
          <div className="event-ticket-summary"><h3>{ticket.name}</h3><strong className="event-ticket-price">{ticket.price === 0 ? "Gratis" : money(ticket.price)}</strong><span className="event-ticket-unit">per tiket</span><p className="event-ticket-quota">{Math.max(0, ticket.quotaLeft)} dari {ticket.quota} tiket tersedia</p>{(ticket.startsAt || ticket.endsAt) && <p className="event-ticket-period">{ticket.startsAt && <>Mulai {eventDateTime(ticket.startsAt)}<br /></>}{ticket.endsAt && <>Sampai {eventDateTime(ticket.endsAt)}</>}</p>}</div>
          <div className="event-ticket-benefits"><ul>{ticket.benefits.map(benefit => <li key={benefit}><Check size={17} aria-hidden="true" /><span>{benefit}</span></li>)}</ul></div>
          <div className="event-ticket-footer">
            {ticket.quantityLimit && <p className="event-section-note">Maksimal {ticket.quantityLimit} tiket per pemesanan.</p>}
            <EventAction event={event} ticketId={ticket.id} now={now} />
          </div>
        </article>;
      }) : <p className="event-empty">Tiket {attendanceLabels[attendance].toLowerCase()} belum tersedia. {event.type === "HYBRID" ? "Silakan periksa pilihan cara hadir lainnya." : "Informasi tiket akan diumumkan oleh penyelenggara."}</p>}</div>
  </div></section>;
}

export function EventCountdownSection({ event, block, id }: SectionProps) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (event.lifecycle !== "upcoming") return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [event.lifecycle]);
  const remaining = now === null ? null : Math.max(0, Date.parse(event.startAt) - now);
  const values = remaining === null ? ["—", "—", "—", "—"] : [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60].map(value => String(value).padStart(2, "0"));
  const title = event.lifecycle === "completed" ? "Terima kasih telah belajar bersama." : event.lifecycle === "ongoing" ? "Kegiatan sedang berlangsung." : "Catat jadwal, siapkan langkah Anda.";
  return <section id={id} className="brand-container event-detail-section event-countdown-section"><div><span className="brand-eyebrow">{event.lifecycle === "upcoming" ? "Menuju hari kegiatan" : "Status kegiatan"}</span><h2>{blockTitle(block, title)}</h2><p className="event-section-note">{eventDate(event.startAt)} · {eventTimeRange(event.startAt, event.endAt)}</p></div>{event.lifecycle === "upcoming" && <dl className="event-countdown" aria-label="Waktu menuju kegiatan">{["Hari", "Jam", "Menit", "Detik"].map((label, index) => <div key={label}><dt>{label}</dt><dd>{values[index]}</dd></div>)}</dl>}</section>;
}

export function EventFaqSection({ event, block, id, attendance, onAttendanceChange }: SectionProps & AttendanceProps) {
  const faqs = eventFaq(event, attendance);
  return <section id={id} className="brand-container event-detail-section">
    <EventSectionHeading eyebrow="Informasi peserta" title={blockTitle(block, "Pertanyaan yang sering diajukan.")} />
    <AttendanceSelector event={event} attendance={attendance} onAttendanceChange={onAttendanceChange} label="FAQ berdasarkan kehadiran" />
    <div className="event-faq-grid"><div className="event-faq-list">{faqs.map(({ question, answer }) => <details key={question}><summary>{question}<ChevronDown size={17} aria-hidden="true" /></summary><p>{answer}</p></details>)}{block.body && block.body !== "Sertifikat tersedia setelah pre-test, kehadiran, post-test, dan feedback selesai." && <details><summary>Informasi tambahan penyelenggara<ChevronDown size={17} aria-hidden="true" /></summary><p>{block.body}</p></details>}</div><aside className="event-help"><Headphones size={30} strokeWidth={1.5} aria-hidden="true" /><h3>Butuh bantuan?</h3><p>Tim Awan Event siap membantu Anda memahami pendaftaran dan persiapan kegiatan.</p><Link className="brand-button brand-button--outline" href="/contact">Hubungi kami<ArrowRight size={16} aria-hidden="true" /></Link></aside></div>
  </section>;
}

export function EventFinalCta({ event, block, id }: SectionProps) {
  return <section id={id} className="brand-container event-detail-section event-final-wrap"><div className="event-final-cta"><BrandWaves /><div><h2>{blockTitle(block, event.lifecycle === "completed" ? "Temukan kesempatan belajar berikutnya." : "Siap untuk langkah berikutnya?")}</h2><p>{block.body || "Jadikan setiap pengalaman belajar bagian dari perjalanan profesional Anda."}</p></div>{event.lifecycle === "completed" ? <Link href="/events" className="brand-button">Jelajahi event<ArrowRight size={16} aria-hidden="true" /></Link> : <EventAction event={event} />}</div></section>;
}

import Link from "next/link";
import type { EventType, EventSummary, RegistrationStatus } from "@/lib/event-types";
import { eventTimeRange } from "@/lib/event-time";

const typeLabel: Record<EventType, string> = {
  ONLINE: "Online",
  ONSITE: "Onsite",
  HYBRID: "Hybrid",
};

const typeTone: Record<EventType, string> = {
  ONLINE: "bg-[#E9F2FE] text-[#3A237E]",
  ONSITE: "bg-[#F3E8FF] text-[#7A2E70]",
  HYBRID: "bg-[#EDE7F6] text-[#5E35B1]",
};

const visualTone: Record<EventType, string> = {
  ONLINE: "from-[#E9F2FE] via-[#D9E9FC] to-[#B9D7F8] text-[#241656]",
  ONSITE: "from-[#241656] via-[#3A237E] to-[#B446A2] text-white",
  HYBRID: "from-[#170C3D] via-[#3A237E] to-[#8E63E6] text-white",
};

const registrationStatusLabel: Record<RegistrationStatus, string> = {
  OPEN: "Pendaftaran buka",
  COMING_SOON: "Segera dibuka",
  SOLD_OUT: "Kuota penuh",
  CLOSED: "Pendaftaran tutup",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  timeZone: "Asia/Jakarta",
});

const monthYearFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const nextDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
      <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EventVisual({ event, index }: EventCardProps) {
  const eventDate = new Date(event.startAt);

  return (
    <div
      className={`event-visual relative min-h-[310px] overflow-hidden rounded-[28px_28px_28px_6px] bg-gradient-to-br p-6 md:min-h-[380px] ${visualTone[event.type]}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,#000,transparent_82%)]" />
      <div className="event-ring absolute -bottom-28 -right-20 h-80 w-80 rounded-full border border-current opacity-15" />
      <div className="event-ring event-ring-delay absolute -bottom-12 -right-3 h-52 w-52 rounded-full border border-current opacity-15" />

      <div className="relative z-[1] flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] opacity-75">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span className="rounded-full border border-current/20 bg-white/10 px-3 py-2 backdrop-blur-md">
          {typeLabel[event.type]}
        </span>
      </div>

      <div className="event-cross absolute left-[17%] top-[34%] h-24 w-24 rotate-6" aria-hidden="true">
        <span className="absolute inset-y-0 left-1/2 w-7 -translate-x-1/2 rounded-lg bg-current opacity-80" />
        <span className="absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 rounded-lg bg-current opacity-80" />
      </div>

      <div className="absolute bottom-6 right-7 z-[1] flex items-end gap-3 md:bottom-8 md:right-9">
        <strong className="text-[112px] font-semibold leading-[0.72] tracking-[-0.1em] md:text-[150px]">
          {dayFormatter.format(eventDate)}
        </strong>
        <span className="pb-1 font-mono text-[9px] uppercase tracking-[0.12em] [writing-mode:vertical-rl] [transform:rotate(180deg)]">
          {monthYearFormatter.format(eventDate)}
        </span>
      </div>
    </div>
  );
}

export type EventCardProps = {
  event: EventSummary;
  index: number;
};

export function EventCard({ event, index }: EventCardProps) {
  const limitedQuota = event.quotaLeft <= 25;

  return (
    <article className="group grid gap-7 border-t border-content-title/20 py-8 lg:grid-cols-[minmax(350px,.82fr)_minmax(0,1.18fr)] lg:gap-12 lg:py-11">
      <EventVisual event={event} index={index} />

      <div className="flex min-w-0 flex-col justify-between py-1">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.11em] text-content-muted">
            <span className={`rounded-full px-3 py-2 ${typeTone[event.type]}`}>{typeLabel[event.type]}</span>
            {event.recurrence && (
              <span className="recurring-badge inline-flex items-center gap-2 rounded-full border border-primary-600/15 bg-white px-3 py-2 text-primary-600">
                <i className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                Berulang
              </span>
            )}
            <span>{event.category}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
            <span>{event.credits > 0 ? `${event.credits} kredit` : "Sertifikat tersedia"}</span>
            <span className={event.registrationStatus === "OPEN" ? "text-[#087A55]" : event.registrationStatus === "SOLD_OUT" ? "text-[#B42318]" : "text-[#A76108]"}>
              {registrationStatusLabel[event.registrationStatus]}
            </span>
          </div>

          <h2 className="max-w-[780px] text-3xl font-semibold leading-[1.04] tracking-[-0.045em] text-content-title transition-colors duration-300 group-hover:text-primary-600 md:text-[44px]">
            {event.title}
          </h2>
          <p className="mt-5 text-sm text-content-muted">Bersama {event.speaker}</p>
        </div>

        {event.recurrence && (
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-l-2 border-accent pl-4 text-xs text-content-muted">
            <span className="font-medium text-content-title">{event.recurrence.label}</span>
            <span>
              Jadwal berikutnya: <strong className="font-medium text-primary-600">{nextDateFormatter.format(new Date(event.recurrence.nextDates[0]))}</strong>
            </span>
          </div>
        )}

        <dl className="mt-11 grid gap-7 border-t border-[#E5E7EB] pt-6 sm:grid-cols-[1fr_1.2fr_auto] sm:items-end">
          <div>
            <dt className="detail-label">Tanggal &amp; waktu</dt>
            <dd className="detail-value">{dateFormatter.format(new Date(event.startAt))}</dd>
            <dd className="mt-1 text-xs text-content-muted">{eventTimeRange(event.startAt, event.endAt)}</dd>
          </div>
          <div>
            <dt className="detail-label">Lokasi</dt>
            <dd className="detail-value">{event.city}</dd>
            <dd className="mt-1 line-clamp-1 text-xs text-content-muted">{event.venue}</dd>
          </div>
          <div className="flex items-center justify-between gap-5 sm:justify-end">
            <div className="sm:text-right">
              <dt className="detail-label">Mulai dari</dt>
              <dd className="detail-value">{priceFormatter.format(event.price)}</dd>
              <dd className={`mt-1 text-xs ${limitedQuota ? "text-[#B56A09]" : "text-content-muted"}`}>
                {limitedQuota ? "Kuota menipis · " : ""}Tersisa {event.quotaLeft} kursi
              </dd>
            </div>
            <Link
              href={`/events/${event.slug}`}
              aria-label={`Lihat detail ${event.title}`}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-content-title/15 text-content-title transition duration-300 hover:-rotate-45 hover:border-primary-600 hover:bg-primary-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4 active:scale-95"
            >
              <ArrowIcon />
            </Link>
          </div>
        </dl>
      </div>
    </article>
  );
}

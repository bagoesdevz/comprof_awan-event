import Link from "next/link";
import { eventPublicPath } from "@/lib/event-sharing";
import type { EventType, RegistrationStatus } from "@/lib/event-types";
import type { ManagedEvent } from "@/lib/platform-model";
import { EventCover } from "./event-cover";
import { registrationStatusAt } from "@/lib/event-detail";
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

export type EventCardProps = {
  event: ManagedEvent;
  index: number;
};

export function EventCard({ event }: EventCardProps) {
  const limitedQuota = event.quotaLeft <= 25;
  const registrationStatus = registrationStatusAt(event, Date.now());

  return (
    <article data-ui="event-card" className="group grid gap-7 border-t border-content-title/20 py-8 lg:grid-cols-[minmax(350px,.82fr)_minmax(0,1.18fr)] lg:gap-12 lg:py-11">
      <div className="event-card-cover"><EventCover event={event} sizes="(max-width: 1023px) 90vw, 45vw" /></div>

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
            <span className={registrationStatus === "OPEN" ? "text-[#087A55]" : registrationStatus === "SOLD_OUT" ? "text-[#B42318]" : "text-[#A76108]"}>
              {registrationStatusLabel[registrationStatus]}
            </span>
          </div>

          <h2 className="max-w-[780px] text-3xl font-semibold leading-[1.04] tracking-[-0.045em] text-content-title md:text-[44px]">
            <Link href={eventPublicPath(event)} className="ux-event-title">{event.title}</Link>
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
              href={eventPublicPath(event)}
              aria-label={`Lihat detail ${event.title}`}
              data-ui="button"
              data-variant="outline"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full border border-content-title/15 px-5 text-sm font-semibold text-content-title transition-colors hover:border-primary-600 hover:bg-primary-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4"
            >
              Detail
            </Link>
          </div>
        </dl>
      </div>
    </article>
  );
}

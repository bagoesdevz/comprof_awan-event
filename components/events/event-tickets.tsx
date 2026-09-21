import Link from "next/link";
import type { TicketOption } from "@/lib/event-types";
import type { RegistrationStatus } from "@/lib/event-types";

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

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">
      <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const actionLabel: Record<RegistrationStatus, string> = {
  OPEN: "Daftar sekarang",
  COMING_SOON: "Pendaftaran segera dibuka",
  SOLD_OUT: "Kuota sudah penuh",
  CLOSED: "Pendaftaran ditutup",
};

type EventTicketsProps = {
  tickets: TicketOption[];
  eventSlug: string;
  registrationStatus: RegistrationStatus;
};

export function EventTickets({ tickets, eventSlug, registrationStatus }: EventTicketsProps) {
  return (
    <section id="tickets" className="scroll-mt-6 bg-surface-muted py-16 sm:py-20 lg:py-32" aria-labelledby="tickets-heading">
      <div className="mx-auto w-[min(1280px,calc(100%-32px))]">
        <div className="mb-10 grid gap-6 sm:mb-14 md:grid-cols-[1fr_auto] md:items-end md:gap-7">
          <div>
            
            <h2 id="tickets-heading" className="mt-5 text-[clamp(38px,5vw,72px)] font-semibold leading-[0.96] tracking-tight sm:tracking-[-0.06em]">Pilih cara hadirmu.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-content-muted md:text-right">Pembelian belum aktif pada tahap frontend. Pilihan berikut memakai data tiruan.</p>
        </div>

        {tickets.length > 0 ? (
          <div className={`grid gap-5 ${tickets.length > 1 ? "md:grid-cols-[1.08fr_.92fr]" : "max-w-2xl"}`}>
            {tickets.map((ticket, index) => {
              const availability = Math.max(0, Math.min(100, (ticket.quotaLeft / ticket.quota) * 100));
              const limited = availability <= 35;

              return (
                <article key={ticket.id} className={`relative flex min-h-[430px] flex-col rounded-[28px_28px_28px_6px] border p-6 sm:min-h-[450px] sm:p-8 ${index === 0 ? "border-primary-600 bg-white shadow-diffusion" : "border-content-title/10 bg-primary-100"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary-600">{ticket.attendance === "ONLINE" ? "Online" : "Onsite"}</span>
                    <span className={`rounded-full px-3 py-2 text-[10px] font-medium ${limited ? "bg-[#FFFBEB] text-[#A76108]" : "bg-[#ECFDF5] text-[#087A55]"}`}>
                      {limited ? "Kuota menipis" : "Tersedia"}
                    </span>
                  </div>

                  <h3 className="mt-8 text-3xl font-semibold tracking-[-0.045em]">{ticket.name}</h3>
                  <p className="mt-3 text-2xl font-semibold text-primary-600">{priceFormatter.format(ticket.price)}</p>

                  <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.08em] text-content-muted">
                      <span>Kuota tersedia</span>
                      <span><strong className="font-medium text-content-title">{ticket.quotaLeft}</strong> / {ticket.quota}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-primary-100" role="progressbar" aria-label={`Kuota ${ticket.name}`} aria-valuemin={0} aria-valuemax={ticket.quota} aria-valuenow={ticket.quotaLeft}>
                      <span className={`block h-full rounded-full ${limited ? "bg-[#D88A1A]" : "bg-primary-600"}`} style={{ width: `${availability}%` }} />
                    </div>
                  </div>

                  <ul className="mt-8 grid gap-4 border-t border-content-title/10 pt-7">
                    {ticket.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3 text-sm text-content-body">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-100 text-primary-600"><CheckIcon /></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {registrationStatus === "OPEN" && ticket.quotaLeft > 0 ? (
                    <Link
                      href={{ pathname: `/events/${eventSlug}/register`, query: { ticket: ticket.id } }}
                      aria-label={`Daftar dengan ${ticket.name}`}
                      className="mt-auto flex min-h-14 items-center justify-between gap-3 rounded-full bg-primary-950 py-2 pl-5 pr-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4 active:scale-[0.98]"
                    >
                      <span className="whitespace-nowrap">{actionLabel[registrationStatus]}</span>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-600"><ArrowIcon /></span>
                    </Link>
                  ) : registrationStatus === "SOLD_OUT" || ticket.quotaLeft === 0 ? (
                    <Link href={{ pathname: `/waitlist/${eventSlug}`, query: { ticket: ticket.id } }} className="mt-auto flex min-h-14 items-center justify-between gap-3 rounded-full bg-primary-950 py-2 pl-5 pr-2 text-sm font-semibold text-white transition hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4">
                      <span>Masuk waitlist</span><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-800"><ArrowIcon /></span>
                    </Link>
                  ) : (
                    <button disabled className="mt-auto flex min-h-14 cursor-not-allowed items-center justify-between gap-3 rounded-full bg-primary-950 py-2 pl-5 pr-2 text-sm font-semibold text-white opacity-55">
                      <span>{ticket.quotaLeft === 0 ? actionLabel.SOLD_OUT : actionLabel[registrationStatus]}</span>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-800"><ArrowIcon /></span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border-y border-content-title/15 py-16">
            <h3 className="text-2xl font-semibold tracking-[-0.04em]">Tiket belum tersedia.</h3>
            <p className="mt-3 text-sm text-content-muted">Pilihan tiket akan tampil setelah pendaftaran dibuka.</p>
          </div>
        )}
      </div>
    </section>
  );
}

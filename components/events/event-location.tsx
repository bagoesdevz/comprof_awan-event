import type { EventType } from "@/lib/event-types";

type EventLocationProps = {
  type: EventType;
  venueName?: string;
  venueAddress?: string;
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">
      <path d="M5 15 15 5M7 5h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapArtwork() {
  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-[28px_28px_7px_28px] bg-primary-900 text-white sm:min-h-[360px]" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="absolute left-[8%] top-[18%] h-[1px] w-[72%] rotate-[24deg] bg-white/15" />
      <div className="absolute bottom-[22%] right-[6%] h-[1px] w-[80%] -rotate-[18deg] bg-white/15" />
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      <span className="location-pin absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent font-mono text-[8px] tracking-[0.08em]">VENUE</span>
    </div>
  );
}

function StreamingArtwork() {
  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-[28px_28px_7px_28px] bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600 text-white sm:min-h-[360px]" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12" />
      <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/16" />
      <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-primary-900 shadow-[0_24px_55px_rgba(23,12,61,.25)]">
        <span className="ml-1 h-0 w-0 border-y-[11px] border-l-[17px] border-y-transparent border-l-primary-600" />
      </div>
      <span className="absolute bottom-7 left-7 font-mono text-[9px] uppercase tracking-[0.13em] text-white/55">Live classroom access</span>
    </div>
  );
}

export function EventLocation({ type, venueName, venueAddress }: EventLocationProps) {
  const hasVenue = type === "ONSITE" || type === "HYBRID";
  const hasStreaming = type === "ONLINE" || type === "HYBRID";
  const mapUrl = hasVenue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName ?? ""} ${venueAddress ?? ""}`)}`
    : undefined;

  return (
    <section className="bg-primary-100 py-16 sm:py-20 lg:py-24" aria-labelledby="location-heading">
      <div className="mx-auto w-[min(1280px,calc(100%-32px))]">
        <div className="mb-10 grid gap-6 sm:mb-12 md:grid-cols-[1fr_auto] md:items-end md:gap-8">
          <div>
            
            <h2 id="location-heading" className="mt-5 text-[clamp(36px,5vw,68px)] font-semibold leading-[0.96] tracking-tight sm:tracking-[-0.06em]">
              {type === "ONLINE" ? "Masuk kelas dari mana saja." : type === "ONSITE" ? "Temui kami di venue." : "Hadir di venue atau dari rumah."}
            </h2>
          </div>
          <span className="w-fit rounded-full border border-primary-600/15 bg-white px-4 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-primary-600">
            {type === "ONLINE" ? "Online" : type === "ONSITE" ? "Onsite" : "Hybrid"}
          </span>
        </div>

        <div className={`grid gap-6 ${hasVenue && hasStreaming ? "lg:grid-cols-2" : "lg:grid-cols-[.9fr_1.1fr]"}`}>
          {hasVenue && (
            <article className="grid gap-6 rounded-[28px_28px_28px_7px] border border-primary-600/10 bg-white p-5 sm:gap-8 sm:p-8">
              <MapArtwork />
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-primary-600">Lokasi onsite</span>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">{venueName}</h3>
                <p className="mt-4 max-w-lg text-sm leading-6 text-content-body">{venueAddress}</p>
                <p className="mt-4 max-w-lg text-xs leading-5 text-content-muted">Instruksi kedatangan lengkap dikirim bersama e-tiket dan pengingat H-1.</p>
                <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-600/20 px-5 text-sm font-semibold text-primary-600 transition hover:-translate-y-0.5 hover:bg-primary-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4 active:scale-[0.98]">
                  Buka Google Maps <ArrowIcon />
                </a>
              </div>
            </article>
          )}

          {hasStreaming && (
            <article className="grid gap-6 rounded-[28px_28px_28px_7px] border border-primary-600/10 bg-white p-5 sm:gap-8 sm:p-8">
              <StreamingArtwork />
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-primary-600">Akses online</span>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">Ruang kelas digital</h3>
                <p className="mt-4 max-w-lg text-sm leading-6 text-content-body">Link streaming tersedia di dashboard peserta setelah pembayaran terverifikasi.</p>
                <p className="mt-4 max-w-lg text-xs leading-5 text-content-muted">Pengingat akses dikirim melalui email H-1 dan dua jam sebelum sesi dimulai.</p>
                <span className="mt-7 inline-flex min-h-11 items-center rounded-full bg-primary-100 px-5 font-mono text-[9px] uppercase tracking-[0.11em] text-primary-600">Terbuka setelah registrasi</span>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

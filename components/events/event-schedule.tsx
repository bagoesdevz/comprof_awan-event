import type { EventSession } from "@/lib/event-types";

export function EventSchedule({ sessions }: { sessions: EventSession[] }) {
  return (
    <section className="bg-primary-950 py-16 text-white sm:py-20 lg:py-32" aria-labelledby="schedule-heading">
      <div className="mx-auto grid w-[min(1280px,calc(100%-32px))] gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
        <div>
          <span className="section-label text-primary-400">Susunan acara</span>
          <h2 id="schedule-heading" className="mt-5 text-[clamp(36px,4.6vw,66px)] font-semibold leading-[0.96] tracking-tight sm:tracking-[-0.06em]">Satu hari yang terarah.</h2>
          <p className="mt-6 max-w-sm text-sm leading-6 text-white/48">Jadwal dapat berubah mengikuti kebutuhan fasilitator dan dinamika kelas.</p>
        </div>

        {sessions.length > 0 ? (
          <ol className="border-t border-white/18">
            {sessions.map((session, index) => (
              <li key={`${session.time}-${session.title}`} className="group/session grid grid-cols-[52px_minmax(0,1fr)] gap-4 border-b border-white/18 py-6 transition-colors hover:bg-white/[0.025] sm:grid-cols-[70px_minmax(0,1fr)_auto] sm:gap-6 sm:px-4 sm:py-7">
                <time className="font-mono text-[10px] text-primary-400" dateTime={session.time}>{session.time}</time>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.03em] transition-transform duration-300 group-hover/session:translate-x-1 sm:text-xl">{session.title}</h3>
                  <p className="mt-2 text-sm text-white/45">{session.note}</p>
                </div>
                <span className="hidden font-mono text-[9px] text-white/25 sm:block">{String(index + 1).padStart(2, "0")}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="border-y border-white/18 py-16">
            <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-primary-400">Jadwal disiapkan</span>
            <p className="mt-4 text-2xl font-semibold tracking-[-0.035em]">Susunan sesi akan diumumkan segera.</p>
            <p className="mt-3 text-sm text-white/45">Peserta terdaftar akan menerima pembaruan melalui email.</p>
          </div>
        )}
      </div>
    </section>
  );
}

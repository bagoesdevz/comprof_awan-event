import type { EventSpeaker } from "@/lib/event-types";

function SpeakerPortrait({ index }: { index: number }) {
  const tones = [
    "from-primary-100 to-surface-tint text-primary-800",
    "from-[#F3E8FF] to-[#EDE7F6] text-[#7A2E70]",
    "from-surface-tint to-[#D9E9FC] text-primary-600",
  ];

  return (
    <div className={`speaker-portrait grid aspect-[4/5] place-items-center overflow-hidden rounded-[28px_28px_28px_6px] bg-gradient-to-br ${tones[index % tones.length]}`} aria-hidden="true">
      <div className="relative h-48 w-48 transition-transform duration-500 group-hover/speaker:-translate-y-2">
        <span className="absolute left-1/2 top-2 h-24 w-24 -translate-x-1/2 rounded-full border-[14px] border-current opacity-65" />
        <span className="absolute bottom-0 left-1/2 h-28 w-44 -translate-x-1/2 rounded-[80px_80px_15px_15px] bg-current" />
      </div>
    </div>
  );
}

export function EventSpeakers({ speakers }: { speakers: EventSpeaker[] }) {
  return (
    <section className="mx-auto w-[min(1280px,calc(100%-32px))] py-16 sm:py-20 lg:py-32" aria-labelledby="speakers-heading">
      <div className="mb-10 grid gap-6 sm:mb-14 md:grid-cols-[1fr_auto] md:items-end md:gap-8">
        <div>
          
          <h2 id="speakers-heading" className="mt-5 text-[clamp(38px,5vw,72px)] font-semibold leading-[0.96] tracking-tight sm:tracking-[-0.06em]">Belajar bersama praktisi.</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-content-muted md:text-right">Pengalaman lapangan diterjemahkan menjadi pembelajaran yang dekat dengan praktik sehari-hari.</p>
      </div>

      {speakers.length > 0 ? (
        <div className={`grid gap-8 ${speakers.length > 1 ? "md:grid-cols-[1.08fr_.92fr]" : "max-w-2xl"}`}>
          {speakers.map((speaker, index) => (
            <article key={speaker.name} className="group/speaker min-w-0">
              <SpeakerPortrait index={index} />
              <div className="grid gap-5 border-b border-content-title/15 px-1 py-6 sm:grid-cols-[1fr_auto]">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-primary-600">{speaker.role}</span>
                  <h3 className="mt-3 text-xl font-semibold leading-tight tracking-[-0.04em] sm:text-2xl">{speaker.name}</h3>
                  <p className="mt-2 text-xs text-content-muted">{speaker.organization}</p>
                </div>
                <span className="font-mono text-[9px] text-content-muted">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <p className="px-1 pt-5 text-sm leading-6 text-content-body">{speaker.bio}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-y border-content-title/15 py-16">
          <h3 className="text-2xl font-semibold tracking-[-0.04em]">Profil pembicara segera diumumkan.</h3>
          <p className="mt-3 text-sm text-content-muted">Informasi akan diperbarui sebelum pendaftaran dibuka.</p>
        </div>
      )}
    </section>
  );
}

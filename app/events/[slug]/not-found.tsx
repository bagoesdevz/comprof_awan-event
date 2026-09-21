import Link from "next/link";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 rotate-180 fill-none stroke-current stroke-[1.7]">
      <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function EventNotFound() {
  return (
    <main className="relative grid min-h-[100dvh] overflow-hidden bg-primary-950 px-4 text-white">
      <div className="noise-layer" aria-hidden="true" />
      <div className="absolute -right-48 -top-48 h-[680px] w-[680px] rounded-full border border-white/10" />
      <div className="relative z-[1] mx-auto grid w-full max-w-3xl content-center py-20">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary-400">404 / Event tidak ditemukan</span>
        <h1 className="mt-7 text-[clamp(52px,9vw,104px)] font-semibold leading-[0.88] tracking-[-0.07em]">Jadwal ini sudah tidak tersedia.</h1>
        <p className="mt-8 max-w-lg text-base leading-7 text-white/55">Tautan mungkin berubah atau event sudah tidak dipublikasikan. Kembali ke daftar untuk menemukan jadwal lainnya.</p>
        <Link href="/#event-list" className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-950 transition hover:-translate-y-0.5 hover:bg-primary-100 active:scale-[0.98]">
          <ArrowIcon /> Lihat semua event
        </Link>
      </div>
    </main>
  );
}

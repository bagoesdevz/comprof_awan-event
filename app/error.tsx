"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-primary-950 px-4 text-white">
      <div className="max-w-lg border-t border-white/20 pt-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary-400">Jadwal tidak dapat dimuat</span>
        <h1 className="mt-5 text-5xl font-semibold leading-none tracking-tight">Ada kendala saat membuka daftar event.</h1>
        <p className="mt-5 text-sm leading-6 text-white/55">Coba muat ulang halaman. Data yang sudah kamu lihat tidak akan berubah.</p>
        <button onClick={reset} className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-950 transition hover:-translate-y-0.5 active:scale-[0.98]">
          Muat ulang
        </button>
      </div>
    </main>
  );
}

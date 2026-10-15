# Awan Event

Aplikasi Next.js untuk CMS event, pendaftaran peserta, pembayaran Midtrans, aktivitas pembelajaran, dan sertifikat. Hosting: Vercel; database dan autentikasi: Supabase.

Jalankan `npm ci`, lalu `npm run dev`. Pemeriksaan: `npm test`, `npm run lint`, `npm run typecheck`, dan `npm run build`. Build menggunakan `.next-production`.

Lihat [instruksi rilis](PRODUCTION-RELEASE.md) sebelum memperbarui deployment.

Domain utama adalah `https://awanevent.com`. Setelah deployment, permintaan ke `awan-event.vercel.app` dialihkan permanen (308) ke domain utama dengan path dan parameter query tetap dipertahankan. Aturan ada di `next.config.mjs` dan hanya berlaku untuk domain tersebut; localhost serta domain preview lainnya tetap dapat digunakan.

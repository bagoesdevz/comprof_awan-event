# Rilis Awan Event

Status 13 Oktober 2026: domain aktif `https://awanevent.com` merespons HTTP 200. Bundle publik terhubung ke project Supabase `wgjijdkmxafnskpnjlqn` (`https://wgjijdkmxafnskpnjlqn.supabase.co`), sesuai target pengguna. Migrasi `202610130001` berhasil diterapkan dan dicatat dalam riwayat remote. Konfigurasi provider belum diverifikasi.

Verifikasi setelah migrasi: jumlah data tetap satu event, satu profil, dan satu pendaftaran. Keempat RPC baru tersedia hanya untuk `service_role`; `anon` dan `authenticated` tidak memiliki hak eksekusi. RLS aktif, index waitlist tersedia, dan aggregate peserta mengembalikan satu peserta. Tidak ada kandidat pembayaran/sertifikat saat pemeriksaan. Tidak ada pembayaran atau email yang dipicu.

Riwayat remote sebelumnya kosong meskipun tabel legacy dan schema canonical sudah ada. Migrasi terbaru diterapkan lewat `supabase db query --linked --file` kemudian dicatat dengan `migration repair --status applied`. Migrasi lama tidak dijalankan ulang atau ditandai selesai tanpa audit penuh. Jangan menjalankan `db push` secara membabi buta: baseline lama perlu dicocokkan dahulu dengan schema remote.

Pemeriksaan live: `/api/platform` merespons 200 dan memuat event `contoh-webinar-awan-event`. `/api/webinars` juga merespons 200, tetapi tidak menampilkan daftar event yang sama. Header `X-Content-Type-Options` dan `X-Frame-Options` dari perubahan lokal belum muncul. Deployment aktif belum mencerminkan seluruh perbaikan ini.

## Perubahan dan bukti

Hero event dan poster program menggunakan data CMS. Bagian company profile mendukung konten tersimpan. Formulir, akses admin, dialog preview, batas request, dan unggahan diperketat. Next.js diperbarui ke 15.5.27.

API menggunakan `platform_records`. Pendaftaran grup membuat kepesertaan terpisah. Reservasi kuota, expiry, dan refund berjalan atomik dengan revision. Callback memeriksa signature dan status otoritatif Midtrans; refund penuh mengembalikan kuota sekali dan mencabut sertifikat grup.

Sertifikat memeriksa kelayakan, membatasi sumber template, dan memerlukan autentikasi saat unduh. Status email serta jumlah unduhan berasal dari hasil nyata. Format unduhan saat ini SVG.

Sebelas test lokal lulus: rollback transaksi, migrasi dan hak RPC, antrean pembayaran, grup, expiry, refund berulang, signature, sertifikat, sumber template, serta validasi request. Data sintetis memakai PGlite dan stub; tidak mengubah database production. Pemeriksaan browser memakai API fixture pada 1440px dan 375px, sepuluh halaman publik, konten CMS, field, kegagalan snapshot, route guard, header, dan penolakan request lintas origin. Editor hero diperiksa melalui edit, preview, simpan, dan buka kembali.

Audit dependensi production melaporkan nol kerentanan. Audit keseluruhan masih memiliki tujuh temuan high pada tooling build/development dalam rantai `braces`; patch belum tersedia pada jalur tersebut saat pemeriksaan. Migrasi besar Tailwind/ESLint membutuhkan pekerjaan dan verifikasi tampilan tersendiri.

## Urutan rilis

1. Pastikan project Vercel dan Supabase yang benar. Backup database. Tinjau duplikasi pendaftaran aktif dan waitlist sebelum migrasi unique index; selesaikan berdasarkan pesanan asli, jangan menghapus massal.
2. Terapkan seluruh migrasi berurutan, termasuk `supabase/migrations/202610130001_production_guards.sql`, sebelum deploy kode baru. Snapshot dan cron memerlukan RPC baru. Migrasi gagal membatalkan transaksi. Jangan menjalankan seed untuk memperbarui konten production.
3. Tabel legacy tidak dihapus. Pastikan data lama yang diperlukan sudah dipetakan ke `platform_records`. Pendaftaran grup lama belum otomatis memperoleh kepesertaan anak.
4. Atur environment Vercel scope Production dan Node.js 22, lalu deploy commit yang sudah diperiksa. Jangan menaruh key server atau CRON_SECRET dalam variabel NEXT_PUBLIC.
5. Supabase Auth: Site URL memakai domain aktif; izinkan `/auth/callback`. Uji login, logout, undangan, verifikasi email, dan pemulihan password di domain tersebut.
6. Midtrans: server key dan mode harus sesuai lingkungan. Callback menuju `/api/payments/callback`. Verifikasi pembayaran nyata yang terkontrol, webhook berulang, expiry, dan refund menggunakan akun provider yang benar.
7. Verifikasi pengirim Resend serta cron Vercel. Sertifikat berjalan 00:07 UTC dan pembayaran 00:15 UTC setiap hari. Pantau kegagalan dan backlog; sesuaikan frekuensi dengan paket Vercel serta volume nyata.

## Environment

| Layanan | Variabel |
| --- | --- |
| Supabase browser | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` atau `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Supabase server | `SUPABASE_URL` (fallback URL publik), `SUPABASE_PUBLISHABLE_KEY` (fallback key publik), `SUPABASE_SECRET_KEY` atau `SUPABASE_SERVICE_ROLE_KEY` |
| Midtrans | `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION` wajib `true` atau `false` |
| Sertifikat email | `RESEND_API_KEY`, `CERTIFICATE_FROM_EMAIL` (fallback `PAYMENT_RECEIPT_FROM_EMAIL`) |
| Cron | `CRON_SECRET` |

Simpan rahasia di dashboard deployment. Template sertifikat boleh berupa asset lokal atau file publik bucket `event-assets` pada project Supabase yang dikonfigurasi.

## Batas operasional

Refund parsial dan pembayaran sukses setelah pesanan ditutup membutuhkan rekonsiliasi manual. Jika sesi provider dibuat tetapi penyimpanan lokal gagal, periksa order provider sebelum membuat ulang sesi. Jendela idempotensi Resend terbatas; kegagalan database setelah email terkirim perlu ditinjau sebelum retry berkepanjangan.

Cron dibatasi batch dan waktu. Urutan pemeriksaan pembayaran bergilir berdasarkan pemeriksaan terakhir. Waitlist mencatat urutan estimasi; pendaftaran bersamaan belum menjamin nomor posisi eksklusif. Notifikasi waitlist masih dikelola tim.

Build dan test lokal belum membuktikan konfigurasi domain, database, maupun integrasi provider live benar.

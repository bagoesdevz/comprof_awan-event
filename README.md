# Awan Event

Aplikasi Next.js untuk CMS event, pendaftaran peserta, pembayaran Midtrans, aktivitas pembelajaran, dan sertifikat. Hosting: Vercel; database dan autentikasi: Supabase.

Jalankan `npm ci`, lalu `npm run dev`. Pemeriksaan: `npm test`, `npm run lint`, `npm run typecheck`, dan `npm run build`. Build menggunakan `.next-production`.

Lihat [instruksi rilis](PRODUCTION-RELEASE.md) sebelum memperbarui deployment.

Domain utama adalah `https://awanevent.com`. Setelah deployment, permintaan ke `awan-event.vercel.app` dialihkan permanen (308) ke domain utama dengan path dan parameter query tetap dipertahankan. Aturan ada di `next.config.mjs` dan hanya berlaku untuk domain tersebut; localhost serta domain preview lainnya tetap dapat digunakan.

Hero pemateri mengikuti data per event. Di admin, buka **Edit event → Materi & pembicara**, isi nama serta peran/profesi, unggah foto dan pilih **Tampilkan di hero**, lalu simpan event. PNG transparan paling mendekati komposisi referensi; JPG/WebP juga didukung sampai 5 MB. Tanpa pilihan eksplisit, hero memakai pemateri pertama selain moderator. Foto kosong atau gagal dimuat memakai skeleton. Pilihan tersimpan sebagai `speakers[].heroFeatured` pada record event yang ada, tanpa migrasi tabel. Badge hero mengikuti waktu mulai/selesai pelaksanaan dan menghormati preferensi pengurangan gerak.

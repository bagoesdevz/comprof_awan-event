# Awan Event

Aplikasi Next.js untuk CMS event, pendaftaran peserta, pembayaran Midtrans, aktivitas pembelajaran, dan sertifikat. Hosting: Vercel; database dan autentikasi: Supabase.

Jalankan `npm ci`, lalu `npm run dev`. Pemeriksaan: `npm test`, `npm run lint`, `npm run typecheck`, dan `npm run build`. Build menggunakan `.next-production`.

Lihat [instruksi rilis](PRODUCTION-RELEASE.md) sebelum memperbarui deployment.

Super admin dapat mengubah peran akun yang sudah terdaftar melalui **Admin → Akun & peran → pilih Peran → Simpan**, tanpa undangan email. Peran yang tersedia: Peserta, Admin operasional, Super admin. Peran akun sendiri tidak dapat diubah dari halaman ini. Pengguna dapat memuat ulang halaman untuk memperoleh tampilan sesuai peran barunya. Tombol **Undang akun baru** tetap tersedia untuk membuat undangan terpisah. Daftar akun dimuat per 50 pengguna dengan navigasi halaman. Endpoint PATCH hanya menerima ID akun dan role, memeriksa autentikasi Super admin serta origin, menerapkan batas permintaan, dan memperbarui app_metadata.role melalui Supabase Admin API tanpa mengubah email atau kata sandi.

Domain utama adalah `https://awanevent.com`. Setelah deployment, permintaan ke `awan-event.vercel.app` dialihkan permanen (308) ke domain utama dengan path dan parameter query tetap dipertahankan. Aturan ada di `next.config.mjs` dan hanya berlaku untuk domain tersebut; localhost serta domain preview lainnya tetap dapat digunakan.

Hero semua jenis event memakai teks tanpa foto pemateri atau poster, dengan latar awan/pita ungu dan gerak masuk selama lima detik. Preferensi pengurangan gerak mematikan animasi. Judul panjang dibagi otomatis menjadi tiga kelompok dengan aksen ungu di tengah; pada ponsel teks mengalir kembali sesuai lebar layar. Di admin, buka **Edit event → Materi & pembicara**, isi nama serta peran/profesi, pilih **Tampilkan nama di hero**, lalu simpan event. Tanpa pilihan eksplisit, hero memakai pemateri pertama selain moderator. Pilihan tetap tersimpan sebagai `speakers[].heroFeatured`, tanpa migrasi tabel. Foto unggahan tetap tampil pada kartu di bagian Pemateri, dengan dukungan PNG/JPG/WebP sampai 5 MB. Badge hero mengikuti waktu mulai/selesai pelaksanaan.

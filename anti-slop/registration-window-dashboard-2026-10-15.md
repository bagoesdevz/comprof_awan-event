# Pendaftaran berdasarkan batas admin dan dashboard yang konsisten

15 Oktober 2026. Pengguna melaporkan Join tidak membuka form, menampilkan event tidak tersedia dan event hilang ketika kembali ke dashboard.

## Penyebab pada source

RegistrationWizard menolak semua lifecycle selain upcoming. EventAction pada ongoing mengirim pengguna yang belum terdaftar langsung ke dashboard event. ticketState dan server juga menutup pendaftaran saat lifecycle completed meskipun deadline tiket masih berlaku. Rekomendasi dashboard hanya memasukkan upcoming dan mengecualikan semua riwayat pemesanan, termasuk expired/cancelled/refunded.

Provider menerima setiap snapshot GET sesuai urutan respons tiba. GET lama yang terlambat bisa menimpa snapshot yang lebih baru atau hasil mutation. Pergantian identitas selain sign-out belum membatalkan respons identitas sebelumnya. Saat navigasi klien, provider juga tidak selalu mengambil snapshot baru. Ini merupakan jalur race yang direproduksi dengan transport fixture, bukan klaim bahwa log produksi pengguna sudah diperiksa.

## Perubahan

- ticketState dipakai bersama tombol, form dan server. Deadline tiket yang diisi admin menentukan penutupan, terlepas dari upcoming/ongoing/completed. Pada tepat deadline, pendaftaran ditolak. Jika tanggal akhir tiket kosong, endAt acara menjadi batas bawaan. Draft, penutupan manual, jadwal mulai, tiket inactive, kuota dan batas quantity tetap berlaku.
- Join pengguna belum terdaftar menuju form register; pengguna sudah terdaftar menuju tiket/pembayaran mereka. CTA penutup detail event memakai aturan yang sama, termasuk untuk completed.
- Program yang published tetap masuk rekomendasi sepanjang lifecycle. Status pendaftaran ditampilkan dan CTA disesuaikan. Riwayat expired/cancelled/refunded tidak menghilangkan kesempatan daftar ulang. Setelah mendaftar, program tampil di Event saya. Jika detail event tidak ada di snapshot, kartu bukti pendaftaran tetap tampil dengan tindakan muat ulang.
- Form tidak memindahkan pengguna keluar ketika data belum tersedia; ada muat ulang. Kegagalan awal dashboard/form menampilkan retry, bukan loading tanpa akhir. Form memeriksa jadwal kembali setiap detik.
- GET hanya boleh memperbarui state jika masih merupakan versi pembacaan terbaru dan identitas sesi tetap sama. Mutation membatalkan pembacaan sebelumnya. Refresh saat mutation ditunda sampai mutation selesai. Pergantian identitas membersihkan state privat; navigasi halaman dan fokus tab mengambil data terbaru. Tidak ada localStorage berisi data pribadi atau bypass autentikasi.
- Petunjuk admin menjelaskan perbedaan tanggal acara dan batas pendaftaran, termasuk perilaku tanggal akhir kosong. Tidak ada migrasi SQL atau perubahan record remote.

## Arah dan verifikasi

Antislop during tetap mengikuti preferensi global dalam percakapan. ENERGY 1 / RHYTHM 1 / MOTION 1. Perubahan ini memperbaiki perilaku pada layout dan identitas Awan Event yang ada. Ungu menandai aksi; status tertulis menjelaskan ketersediaan. Tidak ada aset atau animasi baru.

- npm run test: 34/34 lulus. Tambahan mencakup deadline tepat waktu pada helper/server, form ongoing/completed, semua lifecycle di rekomendasi, status pemesanan yang boleh daftar ulang, draft dan data gagal/hilang.
- npm run lint dengan max-warnings 0 lulus sesudah perbaikan cleanup effect. Build source final lulus, termasuk lint/typecheck dan 49 halaman.
- Browser memakai komponen serta PlatformProvider asli dalam fixture terisolasi. Hanya transport fetch, auth dan navigasi diganti, bukan kode production. Tidak ada mutation remote atau pengiriman WhatsApp.
- Alur completed dengan deadline mendatang: rekomendasi → form → kembali dashboard (kartu tetap ada) → form → konfirmasi → tiket → popup WhatsApp → Event saya. Alur ongoing juga membuka form. Penutupan deadline pada fixture menutup form tetapi mempertahankan kartu di dashboard dengan status ditutup.
- Respons GET kosong ditunda 1.2 detik dan diselesaikan setelah GET baru: Event tetap 1. GET kosong diselesaikan setelah mutation register: Event tetap 1 dan Pendaftaran tetap 1. GET milik sesi sebelumnya diselesaikan setelah sign-out: sesi tetap Tamu dan Pendaftaran 0.
- GET awal fixture gagal 503: dashboard menampilkan Coba lagi dan kembali memuat event setelah retry.
- Dashboard dan langkah pilihan tiket diperiksa pada 360/390/768/1024/1440, tanpa horizontal overflow. Enter berhasil melanjutkan form dan checkbox konfirmasi bekerja. Screenshot diperiksa dan disimpan di tmp/event-flow-registration-1440.jpg.
- Lima pasangan warna teks/link rekomendasi memiliki kontras 6.98, 5.79, 5.79, 18.16 dan 15.86, semuanya >=4.5:1.
- git diff --check lulus.

## Delivery Gate untuk perubahan ini

- R-02 PASS: teks baru tidak memakai em dash.
- R-03 PASS: dashboard dan form pada lima viewport tidak overflow.
- R-17 PASS: tidak menambah angka pemasaran; jumlah fixture dinyatakan sebagai hasil pengujian.
- R-18 PASS: tidak menambah testimonial.
- R-23 PASS: tidak membuat aset baru.
- R-24 PASS: Join teruji menuju register dan kembali ke dashboard tanpa menghilangkan program.
- R-25 PASS: lima pasangan teks/link yang diperiksa >=4.5:1.
- R-26 PASS: daftar, konfirmasi, navigasi kembali dan retry diuji; kontrol penutupan fixture menonaktifkan daftar.
- R-27 PASS: error awal, data hilang, belum buka, tutup, kuota dan success dipisahkan; data registrasi tidak dihapus ketika detail hilang.
- R-28 PASS: FAQ tidak diubah.
- R-32 PASS: kontrol native dan Enter/checkbox diuji pada form.
- R-33 PASS: source melalui apply_patch; fixture tidak masuk kode produksi.
- R-34 PASS: tidak menambah tema/toggle.
- R-35 PASS: build source final, browser dan 34 tes lulus.
- R-36 PASS: laporan membedakan bug source, fixture dan produksi yang belum diperiksa dengan akun pengguna.
- R-37 PASS: arah operasional aplikasi dipertahankan, dials tercatat.
- R-38 PASS: data pengujian hanya di fixture berlabel jelas.
- R-01 PASS: tidak menambah gradient.
- R-04 PASS: tidak menambah set ikon.
- R-06 PASS: tidak mengubah font aplikasi; fixture memakai stylesheet build.
- R-07 PASS: tidak menambah pola latar.
- R-08 PASS: ikon panah CTA yang ada tetap menandai navigasi.
- R-09 PASS: status kartu mengikuti ketersediaan tiket.
- R-10 PASS: tidak menambah glassmorphism.
- R-12 PASS: tidak menambah shadow.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: kartu tetap mengikuti konten event, tanpa kartu fitur baru.
- R-19 PASS: timer untuk batas pendaftaran, tanpa animasi dekoratif.
- R-22 PASS: tidak menambah ilustrasi.
- Liveliness PASS: dials 1/1/1; aksi daftar dan status sebagai fokus, spacing dan identitas aplikasi tetap dipakai.
- C-1 PASS: perubahan terkait langsung dengan ketidaksesuaian jadwal, routing dan state yang ditemukan.
- C-2 PASS: alur register hingga hasil tersimpan teruji pada provider asli dengan transport fixture.
- C-3 PASS: kartu menunjukkan event published dan pendaftaran tersimpan.
- C-4 PASS: race, batas waktu, retry, keyboard dan lima viewport diuji.
- C-5 PASS: tidak mengklaim hasil transaksi/deployment produksi.
- R-05 PASS: susunan dashboard yang ada dipertahankan.
- R-11 PASS: radius panel dan tombol mengikuti aplikasi.
- R-15 PASS: CTA menyebut Daftar/Lihat tiket, Detail event, Coba lagi atau Muat ulang.
- R-16 PASS: copy menjelaskan status dan tindakan langsung.
- R-20 PASS: identitas Awan Event dipertahankan.
- R-21 PASS: tidak memaksakan tema.
- R-29 PASS: palet brand/netral yang ada.
- R-30 PASS: tidak meniru produk lain.
- R-31 PASS: alasan aturan waktu, routing dan state tercatat di atas.

## Status

Pengguna meminta commit dan push perubahan ini ke origin/main pada 15 Oktober 2026. Deployment belum diverifikasi. Tidak ada data produksi yang diubah. Sambungan CLI ke domain produksi tidak tersedia pada sandbox saat pemeriksaan ini; validasi memakai tes server dan browser fixture. Server fixture sudah dihentikan setelah pengujian.

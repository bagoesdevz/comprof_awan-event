# Sidebar Awan Event, 17 Oktober 2026

Lingkup: navigasi bersama pada seluruh halaman admin dan dashboard peserta. Referensi pengguna diterapkan pada susunan menu utama, submenu bercabang dan permukaan menu aktif; warna mengikuti identitas Awan Event. ENERGY 1 / RHYTHM 1 / MOTION 1.

## Keputusan desain

- Warna: lavender abu lembut #f5f3fa membedakan navigasi dari panel putih; ungu #5031ad menunjukkan halaman aktif.
- Tata letak: sidebar desktop 280px memberi ruang untuk nama kategori; versi kecil 76px mempertahankan seluruh tujuan dalam bentuk ikon.
- Tipografi: Inter yang sudah dipakai aplikasi, menu 14px dengan bobot 500/650 agar hirarki terbaca tanpa uppercase.
- Jarak: target menu minimal 46px dan sela kategori 10px memisahkan tugas tanpa membuat navigasi penuh kartu.
- Permukaan: putih dan bayangan 2px hanya untuk tujuan aktif, mengikuti penekanan pada referensi.
- Garis: cabang lengkung menyatakan hubungan submenu dengan induknya; bukan pola dekorasi latar.
- Ikon: kalender untuk event, orang untuk peserta, dompet untuk keuangan dan perisai untuk sistem; ikon lama dipertahankan untuk mengenali fungsi.
- Gerak: transisi singkat hanya saat disclosure, hover dan perkecil/perbesar; reduced-motion mematikannya.

Tidak menambahkan badge angka rekaan, aset baru, dependensi, migrasi, API atau perubahan data produksi. Menu Sistem tetap hanya untuk super admin. Pengelompokan peserta menjadi Dashboard, Kegiatan saya dan Profil mempertahankan lima tujuan sebelumnya. Navigasi melalui pencarian membuka kelompok tujuan; tombol keluar tetap tersedia saat sidebar kecil. Menu ponsel menyediakan label Menu, focus trap, Escape dan pengembalian fokus.

## Verifikasi

Build produksi lulus kompilasi, lint, tipe dan prerender. Suite 80/80 tes lulus; tiga tes navigasi mencakup pelestarian tujuan, batas menu super admin, pencocokan nested route dan keberadaan seluruh halaman tujuan.

Browser headless memakai AppSidebar, SidebarProvider, AdminShell, ParticipantShell serta primitive Radix asli. Transport sesi, profil dan navigasi Next diganti fixture lokal berlabel. CSS berasal dari build final, dengan urutan stylesheet yang dibaca langsung dari HTML hasil build. Tidak masuk atau keluar akun produksi untuk QA.

Matriks tiga peran pada 360/390/768/1024/1440 menghasilkan 15 pemeriksaan tanpa overflow, target menu kurang dari 44px, atau menu keluar panel. 66 klik tujuan dilakukan pada desktop dan ponsel: 15 tujuan super admin, 13 operasional, lima peserta, masing-masing dua viewport. Setiap klik mengubah route fixture dan aria-current sesuai tujuan. Keberadaan halaman aplikasi diverifikasi terpisah oleh tes dan build, bukan diasumsikan dari server fixture.

| Menu admin | Tujuan teruji |
| --- | --- |
| Ringkasan | /admin |
| Laporan | /admin/reports |
| Event | /admin/events |
| Konten website | /admin/cms |
| Lead program | /admin/operations/leads |
| Peserta | /admin/operations/participants |
| Daftar tunggu | /admin/operations/waitlist |
| Evaluasi | /admin/operations/evaluations |
| Sertifikat | /admin/certificates |
| Check-in | /admin/check-in |
| Transaksi | /admin/payments |
| Keuangan | /admin/operations/finance |
| Draf pesan | /admin/reminders |
| Akun & peran, super admin | /admin/users |
| Pengaturan, super admin | /admin/operations/settings |

| Menu peserta | Tujuan teruji |
| --- | --- |
| Dashboard | /dashboard |
| Kelas saya | /dashboard/events |
| E-tiket | /dashboard/tickets |
| Sertifikat | /dashboard/certificates |
| Profil | /dashboard/profile |

Pemeriksaan kontrol: buka/tutup setiap kelompok; perkecil/perbesar pada tiga lebar desktop; tooltip melalui fokus keyboard; Space dan Enter pada disclosure; pencarian header ke Sertifikat; label Menu ponsel; 35 Tab tetap di dialog; tombol Close dan Escape menutup dan mengembalikan fokus; tujuan terakhir dapat digulir pada 390x568; tautan beranda bekerja; keluar saat kecil mengubah sesi fixture lalu ke login; loading dan error sesi admin menyediakan retry; reduced-motion menghentikan transisi; forced-colors tetap menandai menu aktif; lebar CSS 720 sebagai ekuivalen reflow 200% dari 1440 tanpa overflow.

Pemeriksaan tambahan 15 kontrol lulus: semua kelompok pada tiga peran dibuka dan ditutup; rail dan Ctrl+B memperkecil/perbesar sidebar; logo menuju beranda; klik backdrop ponsel menutup dialog. Console tambahan juga kosong. Pratinjau sidebar saja tersimpan di tmp/sidebar-preview.png.

Kontras dihitung dengan rumus WCAG: teks menu 6,32:1; aktif 8,81:1; induk 15,14:1; hover 13,75:1; fokus 6,61:1; inisial 6,90:1. Fokus disclosure terukur solid 2px #5b3cc4. Console dan page errors pada pengujian final kosong.

Bukti lokal di tmp/sidebar-qa.json, tmp/sidebar-admin-1440.png, tmp/sidebar-admin-390.png, tmp/sidebar-participant-1440.png, tmp/sidebar-participant-390.png dan tmp/sidebar-collapsed.png. Percobaan awal mengukur lebar saat transisi belum selesai dan fixture Link belum meneruskan ref; fixture diperbaiki mengikuti kontrak Next Link, lalu pengujian diulang. Batas verifikasi: sesi backend dan konten semua halaman tujuan tidak diuji manual melalui akun produksi.

## Delivery Gate, lingkup sidebar

- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS: matriks 15 viewport/peran tanpa overflow; target menu minimal 44px, panel pendek dapat digulir.
- R-17 PASS: tanpa badge atau statistik baru; angka laporan berasal dari pemeriksaan lokal.
- R-18 PASS: tanpa testimonial atau identitas rekaan dalam produk.
- R-23 PASS: referensi pengguna mengarahkan layout; logo dan ikon aplikasi dipakai kembali.
- R-24 PASS: seluruh tujuan mempunyai page aplikasi, diperiksa tes dan build.
- R-25 PASS: kontras teks terendah yang diubah 6,32:1, fokus 6,61:1.
- R-26 PASS: 66 klik tujuan, disclosure, trigger, beranda dan keluar fixture bekerja.
- R-27 PASS: navigasi statis tidak menunggu data; loading/error/retry sesi dan menu notifikasi kosong tetap tersedia.
- R-28 PASS: tidak menambah atau mengubah FAQ.
- R-32 PASS: Space/Enter, focus trap, 35 Tab, Escape, fokus kembali dan tooltip keyboard teruji.
- R-33 PASS: perubahan source melalui apply_patch; skrip hanya membundel fixture dan menjalankan QA.
- R-34 PASS: tema terang yang disetujui dipertahankan; forced-colors diperiksa, tidak menambah toggle tema.
- R-35 PASS: build final, 80 tes dan pemeriksaan kontrol yang dirinci di atas dijalankan.
- R-36 PASS: hasil fixture dibedakan dari akun/deployment produksi.
- R-37 PASS: referensi pengguna dan sistem visual Awan Event menjadi arah; dials 1/1/1 diumumkan sebelum edit.
- R-38 PASS: menu dari route nyata; identitas fixture berlabel akun uji lokal.
- R-01 PASS: lavender dan ungu berasal dari identitas brand, tanpa gradient/glow baru.
- R-04 PASS: setiap ikon mewakili kategori atau tujuan yang dijelaskan pada keputusan desain.
- R-06 PASS: Inter aplikasi untuk pembacaan menu, tanpa label monospace atau tracking baru.
- R-07 PASS: garis hanya menyatakan hirarki submenu, tanpa pola latar dekoratif.
- R-08 PASS: chevron hanya menyatakan buka/tutup kelompok, tanpa panah CTA dekoratif.
- R-09 PASS: tanpa badge pemasaran atau jumlah rekaan.
- R-10 PASS: sidebar berwarna solid, tanpa blur baru.
- R-12 PASS: bayangan kecil hanya membedakan tujuan aktif.
- R-13 PASS: tidak menambahkan glow.
- R-14 PASS: tidak menambahkan kartu fitur; menu berulang karena struktur navigasi.
- R-19 PASS: gerak dipicu interaksi, tanpa loop dan patuh reduced-motion.
- R-22 PASS: tidak menambahkan ilustrasi.
- Liveliness dials PASS: ENERGY/RHYTHM/MOTION 1/1/1 sesuai navigasi operasional.
- Liveliness focal point PASS: tujuan aktif putih dengan bobot 650 dan teks ungu.
- Liveliness spacing PASS: kategori berjarak, submenu terhubung dan footer terpisah.
- Liveliness accent PASS: ungu dipusatkan pada tujuan aktif dan fokus.
- Liveliness identity PASS: logo asli, lavender, ungu dan tipografi Awan Event dipertahankan.
- Liveliness Design Read PASS: tujuan layar, audiens dan arah visual diumumkan sebelum implementasi.
- C-1 PASS: alasan warna, layout, font, jarak, garis, ikon, bayangan dan gerak tercatat.
- C-2 PASS: kontrol baru/berubah diuji satu per satu, tanpa kontrol mati.
- C-3 PASS: struktur hanya memuat kategori dan tujuan nyata aplikasi.
- C-4 PASS: tiga peran, viewport, sesi loading/error, keyboard, reduced-motion dan forced-colors diperiksa.
- C-5 PASS: tidak menambahkan klaim atau metrik produk.
- R-05 PASS: hierarki berasal dari kegiatan admin/peserta dan referensi pengguna.
- R-11 PASS: radius 12px menu, 10px kontrol dan inisial bundar punya fungsi berbeda.
- R-15 PASS: label menyebut tujuan atau aksi sebenarnya, termasuk Menu dan Keluar.
- R-16 PASS: tanpa buzzword atau klaim pemasaran.
- R-20 PASS: logo dan palet Awan Event menyatu dengan struktur kegiatan aplikasi.
- R-21 PASS: surface terang mengikuti arahan brand aktif.
- R-29 PASS: satu keluarga ungu/lavender dan netral.
- R-30 PASS: komponen mengikuti gambar pengguna, bukan menyalin produk lain tanpa permintaan.
- R-31 PASS: satu alasan untuk tiap keputusan utama tersedia di atas.
- UI checklist PASS: palet, hirarki, purpose, kontrol dan state diperiksa dalam lingkup navigasi.
- Human checklist PASS: kontras, fokus, keyboard, target sentuh, reflow dan status sesi diperiksa.
- Layoutmobile checklist PASS: drawer berlabel menggantikan rail desktop, konten dapat digulir dan footer tetap terjangkau.

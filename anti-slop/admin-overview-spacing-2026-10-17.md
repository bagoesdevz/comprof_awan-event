# Ringkasan admin: jarak dan kartu statistik

Status: PASS. Arah dari screenshot dan instruksi pengguna: ruang kerja terang, container berjarak di semua sisi, ringkasan selebar konten, agenda di bawahnya, empat kartu statistik abu-abu tua. ENERGY 1 / RHYTHM 1 / MOTION 1. Design Read disampaikan sebelum edit; prioritas halaman adalah membaca kondisi operasional lalu membuka antrean/event terkait.

## Keputusan

- Container admin memiliki margin 24px desktop, 16px tablet dan 8px ponsel di keempat sisi. Bingkai dan sudut ponsel mengikuti ruang yang baru; padding isi tetap memakai skala dashboard.
- Ringkasan memakai satu kolom penuh, diikuti Agenda mendatang dan Transaksi terbaru. Tidak lagi menyisakan kolom kanan untuk agenda. Halaman Laporan mempertahankan urutan ringkasan, pendaftaran, agenda.
- Empat statistik memakai permukaan #3e3c45, angka/label putih dan keterangan #dedce5. Warna gelap diminta pengguna untuk memisahkan statistik, bukan perubahan tema seluruh aplikasi. Jarak antarkartu 12px dan bayangan kartu angka dihapus agar pemisah berasal dari permukaan yang jelas.
- Kartu angka setara karena keempatnya mengukur aspek operasional berbeda tanpa tren/peringkat rekaan. Empat kolom mulai 1200px, dua mulai 600px, satu pada ponsel sempit agar label dan nominal dapat dibaca. Inter, ikon bermakna, aksi ungu, panel putih dan radius 16/20/24/28px mengikuti identitas dashboard.
- CSS statistik dibatasi pada workspace-summary, sehingga kartu statistik peserta tetap putih. Container luar yang baru hanya berlaku untuk admin. Rumus angka, data, hak akses, tujuan tautan, filter dan ekspor tidak berubah.

## Bukti verifikasi

Build produksi lulus kompilasi, lint, tipe dan prerender 49 halaman. Seluruh 91 tes lulus. Tidak menambah tes permanen yang hanya menyalin aturan CSS.

Edge headless menjalankan AdminOverview, AdminShell, ParticipantShell, sidebar dan komponen terkait asli dengan CSS build produksi. Auth, router dan state memakai fixture lokal berlabel, bukan akun/transaksi produksi. Sebanyak 28 kombinasi dua peran admin, dua halaman ringkasan/laporan dan tujuh lebar 360/390/600/768/1024/1200/1440 lulus: margin sama di semua sisi, ringkasan/agenda selebar grid, posisi agenda benar, keempat kartu gelap, jumlah kolom sesuai dan tanpa overflow halaman maupun kartu angka.

Sembilan pemeriksaan regresi pada daftar event admin, profil peserta dan dashboard peserta di tiga lebar lulus; kartu peserta tetap putih. Sidebar kecil mempertahankan margin, menu ponsel dapat dibuka dan ditutup Escape dengan fokus kembali. Sembilan tautan overview benar, Tab/Shift+Tab/Enter tetap bekerja dan fokus solid 2px. Filter periode laporan dan unduh CSV berjalan. Judul panjang, nominal triliunan di tiga lebar, data kosong di dua lebar, reflow 720px, reduced-motion dan forced-colors lulus. Console/page errors kosong. Screenshot desktop, sidebar kecil dan ponsel diperiksa visual.

Kontras terukur dari computed styles: angka/label putih terhadap abu-abu tua 10,84:1; keterangan/ikon 7,99:1; periode abu-abu terhadap putih 5,91:1. Tidak menambah kontrol atau bidang input baru.

Bukti lokal: tmp/admin-overview-spacing-build.log, tmp/admin-overview-spacing-tests.log, tmp/admin-overview-spacing-qa.json, tmp/admin-overview-spacing-browser.log, tmp/admin-overview-spacing-1440.png, tmp/admin-overview-spacing-collapsed-1440.png dan tmp/admin-overview-spacing-390.png. Data screenshot hanya fixture uji lokal. Perubahan source hanya app/workspace-theme.css.

## Delivery Gate

- R-02 PASS: tidak menambah copy antarmuka atau em dash.
- R-03 PASS: 28 kombinasi dan sembilan regresi tanpa overflow; margin/panjang teks diuji.
- R-17 PASS: rumus statistik asli tidak berubah; nilai QA hanya fixture berlabel.
- R-18 PASS: tidak menambah testimonial atau orang rekaan.
- R-23 PASS: tidak membuat aset atau struktur navigasi baru; memakai cover yang sudah tersedia.
- R-24 PASS: sembilan tujuan tautan ringkasan diuji dengan router fixture.
- R-25 PASS: pasangan warna baru 10,84:1 dan 7,99:1, melebihi AA.
- R-26 PASS: navigasi ringkasan, periode dan ekspor CSV tetap berfungsi.
- R-27 PASS: keadaan kosong agenda/transaksi diperiksa; loading/error provider existing tidak diubah.
- R-28 PASS: tidak menambah atau mengubah FAQ.
- R-32 PASS: keyboard, fokus 2px dan Escape drawer diperiksa.
- R-33 PASS: CSS ditulis langsung dengan apply_patch, helper hanya untuk QA lokal.
- R-34 PASS: tema terang dipertahankan; forced-colors dan reduced-motion diperiksa.
- R-35 PASS: build, 91 tes, matriks browser dan klik kontrol relevan lulus.
- R-36 PASS: hasil fixture tidak diklaim sebagai transaksi atau autentikasi produksi.
- R-37 PASS: arah pengguna eksplisit, Design Read dan dials 1/1/1 dicatat.
- R-38 PASS: source hanya mengubah presentasi, tidak memasukkan konten/data fixture ke aplikasi.
- R-01 PASS: tidak menambah gradient atau glow.
- R-04 PASS: ikon kalender, peserta, pembayaran dan kehadiran existing sesuai isi statistik.
- R-06 PASS: Inter mengikuti ruang kerja existing dan angka tabular membantu perbandingan.
- R-07 PASS: tidak menambah pola latar dekoratif.
- R-08 PASS: tidak menambah panah tombol.
- R-09 PASS: badge Tayang/Draf tetap mewakili status publikasi sebenarnya.
- R-10 PASS: tidak menambah glass atau blur.
- R-12 PASS: kartu angka tanpa bayangan; panel putih memakai bayangan pendek existing.
- R-13 PASS: tidak ada glow baru.
- R-14 PASS: ukuran setara untuk empat metrik setingkat, alasan dicatat di atas.
- R-19 PASS: tidak menambah animasi; reduced-motion tetap mematikan transisi.
- R-22 PASS: tidak menambah ilustrasi atau foto.
- Liveliness dials PASS: ENERGY/RHYTHM/MOTION 1/1/1 cocok untuk ringkasan operasional.
- Liveliness focus PASS: statistik gelap menjadi fokus pertama, Buat event tetap aksi ungu utama.
- Liveliness spacing PASS: margin empat sisi dan gap antarpanel/kartu memisahkan tingkat informasi.
- Liveliness accent PASS: ungu tetap dipakai untuk tindakan dan navigasi aktif.
- Liveliness identity PASS: font, logo, sidebar dan warna Awan Event dipertahankan.
- Liveliness Design Read PASS: arah dan susunan dijelaskan sebelum edit.
- C-1 PASS: alasan warna, spacing, urutan, ukuran dan font dicatat.
- C-2 PASS: kontrol relevan diklik, filter dan unduhan diuji.
- C-3 PASS: komposisi mengikuti ringkasan, agenda dan transaksi yang sudah ada.
- C-4 PASS: dua peran, tujuh lebar, sidebar kecil/drawer, kosong, teks panjang dan aksesibilitas diperiksa.
- C-5 PASS: tidak membuat klaim atau angka produk baru.
- R-05 PASS: satu alur vertikal sesuai permintaan, tanpa bagian templat tambahan.
- R-11 PASS: radius statistik, panel dan tombol tetap berbeda menurut fungsi.
- R-15 PASS: label aksi operasional existing jelas, tidak mengganti dengan CTA generik.
- R-16 PASS: tidak menambah buzzword.
- R-20 PASS: identitas Awan Event dan data operasionalnya tetap menjadi konteks desain.
- R-21 PASS: kartu gelap adalah pemisah yang diminta pengguna dalam tema terang.
- R-29 PASS: netral putih/abu dan aksen ungu; status existing tetap semantik.
- R-30 PASS: penyesuaian dari screenshot aplikasi sendiri, bukan kloning produk lain.
- R-31 PASS: semua keputusan utama dan batas QA dicatat.

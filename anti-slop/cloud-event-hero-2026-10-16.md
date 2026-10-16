# Hero awan sesuai referensi, 16 Oktober 2026

Permintaan pengguna menggantikan latar gelombang sederhana dengan referensi awan, pita ungu, bola dekoratif, judul tiga kelompok beraksen ungu, dan informasi terpusat. Referensi eksplisit ini menjadi arah visual; nama, profesi, judul dan angka tetap dari data event. Tidak menambahkan avatar peserta rekaan dari gambar referensi.

Reading this as: hero informasi event untuk calon peserta, komposisi tipografi dengan bingkai awan Awan Event, ENERGY 2 / RHYTHM 1 / MOTION 2. Mode antislop during tetap berlaku dari preferensi global yang sudah dibaca.

## Keputusan dan bukti

- Warna dan font tetap memakai sistem merek. Judul dibatasi 1040px dengan bagian tengah `#8050d4`, sehingga aksen menandai topik tanpa membuat semua elemen ungu.
- `eventHeroTitleParts` membagi judul panjang secara otomatis, tanpa nama kegiatan yang dikunci dalam renderer. Judul pendek tetap mengalir. Pada ponsel, kelompok judul kembali inline agar tidak memaksakan pemenggalan desktop.
- Satu aset dekoratif dibuat dengan imagegen berdasarkan arahan pengguna, tanpa teks, orang, identitas, atau logo. Sumber hasil generasi dipertahankan di direktori generated_images; aset proyek `public/event-hero-clouds.webp` berukuran 1942x809, 54.198 byte setelah optimasi WebP.
- Pita/awan/bola mengikuti referensi pemilik, bukan motif default yang ditambahkan tanpa arahan. Area tengah lapang memberi tempat bagi teks aktual. Gambar `alt=""` berada pada lapisan `aria-hidden` dan tidak menangkap pointer.
- Next Image memuat aset lokal dengan priority dan sizes 100vw. Latar dasar tetap terang jika aset belum tersedia. Data event tidak menunggu gambar selesai dimuat.
- Gerak masuk scale/translate satu kali selama 5 detik memberi kedalaman pada bingkai; teks diam. Reduced-motion menonaktifkannya. Tidak menambah loop dekoratif, blur, kontrol atau shadow.
- Pill jumlah peserta mengikuti referensi, menggunakan participantCount aktual tanpa avatar tiruan. Narasumber tetap mengikuti pilihan admin sebelumnya; upload foto tetap untuk bagian Pemateri. Tidak ada breadcrumb.
- Build produksi lulus termasuk lint, pemeriksaan tipe dan prerender. Suite 48/48 lulus. Tes baru memastikan semua kata judul dipertahankan untuk input kosong, pendek, panjang, whitespace dan tanpa spasi serta aksen sesuai referensi.
- Browser fixture komponen asli: 30 pemeriksaan pada 360/390/768/1024/1440 untuk tiga jenis event, judul/nama sangat panjang, pemateri kosong dan judul pendek; tidak ada overflow halaman/heading/pemateri, tidak ada portrait hero. Bukti `tmp/cloud-hero-qa.json`, `tmp/cloud-hero-1440.png`, `tmp/cloud-hero-390.png`.
- Browser aplikasi build dengan data event aktual: judul lengkap, aksen Kesehatan Reproduksi, gambar selesai dimuat dari optimizer Next Image, breadcrumb 0, overflow false, console kosong. Bukti `tmp/cloud-hero-actual.png`. Saat gambar sedang dimuat, teks dan informasi sudah terlihat di atas latar dasar terang.
- Kontras dari contrast-check.py terhadap batas latar mobile paling gelap `#dfdde0` (overlay putih 88% di atas hitam): teks isi 4,53:1, judul/nama 12,34:1, aksen judul 3,87:1. Aksen hanya dipakai pada heading besar minimal 32px sehingga memenuhi batas 3:1; tidak dipakai untuk teks normal. Pada desktop, isi berada di area terang aset dan lapisan putih pusat 94%. Preferensi reduced-motion diperiksa pada CSS, tanpa mengubah pengaturan OS.
- Tidak ada dependency, migrasi, perubahan API atau mutasi record produksi. Semua fixture bertanda pengujian dan hanya lokal.

## Delivery Gate

Lingkup gate: perubahan hero ini, bukan sertifikasi keseluruhan backend/aplikasi.

- R-02 PASS: copy baru tidak memakai em dash.
- R-03 PASS: 30 pemeriksaan lima viewport tanpa overflow.
- R-17 PASS: angka peserta berasal dari prop yang sudah terhubung ke data aplikasi.
- R-18 PASS: tidak menambah testimoni atau foto peserta rekaan.
- R-23 PASS: aset dekoratif dibuat berdasarkan gambar referensi eksplisit pengguna.
- R-24 PASS: tidak mengubah navigasi; breadcrumb tetap dihapus.
- R-25 PASS: teks isi 4,53:1 minimum konservatif mobile, aksen heading besar 3,87:1.
- R-26 PASS: tidak menambah atau mengubah kontrol/alur pendaftaran.
- R-27 PASS: latar dasar menjaga teks ketika gambar memuat; state loading/error event sebelumnya dipertahankan; pemateri kosong diuji.
- R-28 PASS: FAQ tidak diubah.
- R-32 PASS: dekorasi aria-hidden, tanpa pointer atau tab stop; urutan kontrol tidak berubah.
- R-33 PASS: perubahan langsung pada source dengan patch; optimasi gambar hanya konversi aset, bukan skrip pengganti CSS.
- R-34 PASS: tema terang publik tetap; tidak menambah toggle.
- R-35 PASS: build dan 48 tes lulus, aplikasi dijalankan, gambar optimizer/teks aktual terlihat, console kosong; tidak ada kontrol baru untuk klik tambahan.
- R-36 PASS: tidak menambah klaim keamanan, performa atau pelanggan.
- R-37 PASS: arah pemilik eksplisit, dials tercatat sebelum implementasi.
- R-38 PASS: semua teks dan jumlah berasal dari event; dekorasi tidak menyatakan data/identitas nyata.
- R-01 PASS: ungu mengikuti merek dan referensi; putih pusat mendukung keterbacaan.
- R-04 PASS: tidak menambah ikon; ikon lifecycle sebelumnya tetap menunjukkan status nyata.
- R-06 PASS: Plus Jakarta Sans merek dipertahankan; ukuran heading mendukung hierarki.
- R-07 PASS: tidak menambah grid, blueprint atau dot pattern.
- R-08 PASS: tidak menambah panah tombol.
- R-09 PASS: badge menyampaikan kategori/status yang sudah ada; pill peserta menampung angka aktual sesuai referensi.
- R-10 PASS: tanpa glass/backdrop blur.
- R-12 PASS: tidak menambah shadow.
- R-13 PASS: highlight optis hanya pada ilustrasi tepi sesuai referensi, bukan glow pada kontrol atau teks.
- R-14 PASS: metadata tetap dl, bukan kartu fitur.
- R-19 PASS: satu animasi latar 5 detik, teks diam, reduced-motion aktif pada CSS.
- R-22 PASS: ilustrasi awan/pita merupakan motif yang diminta pemilik untuk Awan Event.
- Liveliness dials PASS: ENERGY 2 / RHYTHM 1 / MOTION 2, judul dominan dan gerak latar singkat.
- Liveliness consistency PASS: satu komposisi disengaja untuk semua tipe event, reflow pada ponsel.
- Liveliness focus PASS: heading beraksen menjadi fokus; metadata tetap sekunder.
- Liveliness whitespace PASS: area pusat aset dan jarak informasi mengelompokkan konten.
- Liveliness accent PASS: satu kelompok judul memakai aksen ungu, informasi lain tetap gelap.
- Liveliness motif PASS: bingkai awan/pita ungu mengikuti referensi khusus pengguna.
- Liveliness Design Read PASS: arah tertulis sebelum edit dan ditopang brief gambar.
- C-1 PASS: alasan warna, layout, font, motion dan aset tertulis di atas.
- C-2 PASS: tidak mengubah kontrol interaktif; semua renderer data tetap terhubung.
- C-3 PASS: tidak menambah section atau konten pengisi.
- C-4 PASS: judul pendek/panjang, pemateri kosong, dan lima viewport diuji.
- C-5 PASS: tidak mengarang statistik, foto peserta atau klaim.
- R-05 PASS: komposisi berdasarkan informasi event dan referensi pemilik, bukan template kartu fitur.
- R-11 PASS: pill peserta sesuai referensi; badge status dan metadata mempertahankan variasi bentuk.
- R-15 PASS: CTA pendaftaran tidak diubah, tidak menambah CTA generik.
- R-16 PASS: tidak menambah buzzword atau copy promosi.
- R-20 PASS: palet ungu, font dan awan mengikuti Awan Event.
- R-21 PASS: tema terang publik yang telah disetujui dipertahankan.
- R-29 PASS: warna inti ungu/putih, warna status tetap semantik yang sudah ada.
- R-30 PASS: referensi berasal dari pengguna, tidak mengkloning produk lain.
- R-31 PASS: setiap keputusan utama memiliki alasan tertulis.

UI skill checklist PASS pada lingkup ini: palet/purpose, hierarchy, responsive, dekorasi terbatas, motion tidak berulang, data faktual, state dan aksesibilitas didukung bukti di atas.

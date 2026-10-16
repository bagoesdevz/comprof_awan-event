# Hero event berbasis teks, 16 Oktober 2026

Lingkup: hero publik dan pratinjau event Webinar, Seminar, Pelatihan; petunjuk pemateri pada admin. Permintaan pengguna: seluruh hero tanpa foto, dengan animasi di belakang teks. Preferensi antislop `during` dibaca dari pengaturan global.

## Arah dan keputusan

Reading this as: hero informasi event untuk calon peserta, tipografi terpusat dalam identitas ungu terang Awan Event, ENERGY 2 / RHYTHM 1 / MOTION 2.

- Banner-design: gabungkan Bold Typography untuk judul sebagai fokus dan Minimalist untuk informasi pendukung; Motion-Ready diterapkan pada motif gelombang merek yang sudah ada. Satu implementasi langsung mengikuti permintaan, bukan beberapa aset banner ekspor.
- Komposisi satu kolom memberi ruang judul panjang dan konsistensi antarjenis event. Lebar judul dibatasi 1040px dan ringkasan 780px; padding responsif menjaga batas baca desktop/ponsel.
- Plus Jakarta Sans dan warna `#211052`, `#5b3cc4`, `#5d607d` mengikuti sistem merek yang ada. Hero terang memberi kontinuitas dengan halaman publik.
- SVG BrandWaves yang sudah ada menjadi lapisan dekoratif `aria-hidden`, tidak menangkap pointer. Lapisan terang menjaga keterbacaan pada seluruh fase animasi.
- Empat gelombang bergerak saling berlawanan satu kali selama 5 detik dengan jeda sampai 0,28 detik. Konten tetap diam. Gerak memperkenalkan motif merek di area hero lalu berhenti; reduced-motion mematikannya.
- Metadata memakai teks dengan pembatas, tanpa kartu/foto/ikon tambahan. Badge lifecycle tetap dipakai karena menunjukkan status kegiatan sebenarnya, termasuk ikon status yang sudah ada.
- Nama dan profesi tetap dinamis melalui `eventHeroSpeaker`. Foto tetap disimpan dan ditampilkan pada bagian Pemateri. Pilihan admin sekarang berlabel Tampilkan nama di hero; hint unggahan menyebut penggunaan foto pada kartu pemateri.
- Komponen portrait hero dan CSS yang tidak dipakai dihapus. Tidak ada dependency, migrasi, perubahan akses, atau mutasi data produksi.

## Bukti

- Suite `npm test`: 47/47 lulus, termasuk pilihan pemateri, validasi foto/flag, dan batas lifecycle. Tidak menambah tes yang menyalin CSS.
- Build produksi `npm run build`: lulus, termasuk lint, pemeriksaan tipe dan prerender halaman. Percobaan sandbox gagal karena EPERM direktori keluaran; build diulang di luar sandbox. Kesalahan prop pada fixture lokal diperbaiki sebelum build akhir berhasil.
- Browser komponen asli dengan transport lokal: 25 pemeriksaan pada 360, 390, 768, 1024, 1440px untuk Webinar/Seminar/Pelatihan, judul/nama tanpa spasi yang panjang, serta data pemateri kosong. Semua tanpa overflow halaman, heading, dan nama; setiap hero memiliki 0 elemen img.
- Browser admin: ubah nama kedua menjadi Narasumber pengujian, profesi menjadi Psikolog Klinik, pilih radio dengan Space. Hero langsung menampilkan kedua nilai; radio `[false,true]`, outline fokus solid, foto hero tetap 0.
- Browser bagian Pemateri: foto kartu 1, foto hero 0. Seluruh pengeditan fixture hanya lokal; tidak menyimpan atau mengunggah data produksi.
- Badge ongoing Sedang berlangsung hijau dan completed Selesai netral terlihat sesuai jadwal fixture. Upcoming Akan datang biru pada pratinjau utama.
- Browser animasi: computed transform empat lapisan berubah saat awal navigasi; setelah selesai menjadi matriks identitas. Durasi 5s, iteration-count 1. Preferensi reduced-motion diverifikasi pada sumber CSS, tidak mengubah pengaturan OS pengguna.
- Console aplikasi fixture: tidak ada error. Bukti lokal: `tmp/text-hero-qa.json`, `tmp/text-hero-1440.png`, `tmp/text-hero-390.png`. Tanggal/jumlah pada fixture ditandai sebagai data pengujian.
- Kontras dihitung dengan contrast-check.py terhadap batas latar konservatif `#ede7fe`: teks isi 5,08:1, heading/nama 13,85:1, aksen peserta 6,05:1. Batas dihitung dari channel warna minimum SVG, opacity 0,65, dan lapisan terang 62%; warna aktual lebih terang.

## Delivery Gate

Gate berlaku pada perubahan hero/petunjuk admin ini; bukan sertifikasi seluruh aplikasi atau audit backend sebelumnya.

- R-02 PASS: copy baru tidak mengandung em dash.
- R-03 PASS: 25 pemeriksaan lima viewport tanpa overflow atau teks keluar.
- R-17 PASS: participantCount tetap berasal dari prop data aplikasi; angka fixture berlabel pengujian.
- R-18 PASS: tidak menambahkan testimoni atau identitas rekaan pada produk.
- R-23 PASS: memakai BrandWaves yang sudah ada; animasi latar diminta eksplisit pengguna.
- R-24 PASS: tidak menambah atau mengubah navigasi.
- R-25 PASS: teks isi minimum 5,08:1 pada batas latar konservatif.
- R-26 PASS: hero tidak menambah kontrol; radio pemateri tetap berfungsi dan diuji.
- R-27 PASS: renderer loading/error/tidak tersedia tetap dipertahankan; fixture tanpa pemateri tetap merender hero teks.
- R-28 PASS: tidak mengubah FAQ atau menambahkan pertanyaan pengisi.
- R-32 PASS: radio dioperasikan dengan Space, outline solid terlihat pada computed style.
- R-33 PASS: perubahan ditulis langsung melalui patch sumber, bukan skrip pengganti CSS.
- R-34 PASS: tidak menambah tema/toggle; mempertahankan tema terang publik.
- R-35 PASS: browser dijalankan, radio dan input yang terkait diuji, console kosong; bukti build dicatat terpisah di atas.
- R-36 PASS: tidak menambah klaim keamanan/performa/pelanggan.
- R-37 PASS: arah dan dials ditetapkan sebelum edit, berasal dari merek dan permintaan pengguna.
- R-38 PASS: judul, ringkasan, jadwal, platform, nama/profesi tetap dari data event.
- R-01 PASS: warna gelombang mengikuti aset merek; lapisan terang memberi hierarki teks.
- R-04 PASS: ikon dekorasi metadata dihapus; ikon badge lifecycle tetap menandai waktu/status nyata.
- R-06 PASS: font merek dipertahankan untuk kesinambungan dan keterbacaan judul.
- R-07 PASS: tidak ada grid, dot pattern, atau blueprint tambahan.
- R-08 PASS: tidak menambah tanda panah tombol.
- R-09 PASS: badge status menyampaikan lifecycle kegiatan, bukan klaim promosi.
- R-10 PASS: tidak menambah glass/backdrop blur.
- R-12 PASS: hero teks tanpa shadow; panel portrait lama dihapus.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: informasi tanggal/platform menjadi dl, bukan kartu fitur seragam.
- R-19 PASS: konten diam; satu gerak latar berhenti setelah 5,28 detik maksimum dan dimatikan reduced-motion.
- R-22 PASS: tidak menambah ilustrasi umum atau foto.
- Liveliness dials PASS: ENERGY 2 / RHYTHM 1 / MOTION 2, judul dominan, gerak latar terbatas.
- Liveliness consistency PASS: semua tipe event memakai komposisi satu kolom yang disengaja.
- Liveliness focus PASS: heading terbesar menjadi fokus; metadata di bawahnya lebih kecil.
- Liveliness whitespace PASS: lebar baca, jarak judul/ringkasan dan garis metadata membentuk kelompok informasi.
- Liveliness accent PASS: ungu peserta/status tetap sekunder terhadap heading gelap.
- Liveliness motif PASS: gelombang BrandWaves Awan Event dipakai kembali.
- Liveliness Design Read PASS: tercatat pada arah sebelum implementasi.
- C-1 PASS: alasan warna/layout/font/spacing/motion tertulis di atas.
- C-2 PASS: radio nama pemateri dan input terkait diuji pada komponen asli.
- C-3 PASS: hanya informasi event yang diperlukan ditampilkan, tanpa section tambahan.
- C-4 PASS: judul/nama panjang dan pemateri kosong diuji pada lima viewport.
- C-5 PASS: tidak menambahkan statistik, profesi, atau testimoni ke data produksi.
- R-05 PASS: hero disusun untuk informasi event; tidak menambah pola hero dan kartu fitur.
- R-11 PASS: pill kategori serta badge status bersudut 10px dipertahankan; metadata tanpa panel.
- R-15 PASS: tidak menambah CTA generik atau mengubah alur pendaftaran.
- R-16 PASS: copy admin menjelaskan fungsi konkret nama/foto.
- R-20 PASS: font, palet dan gelombang mengikuti Awan Event.
- R-21 PASS: mempertahankan tema terang publik yang sudah disetujui pengguna.
- R-29 PASS: warna inti ungu/terang; warna badge semantik mengikuti sistem lifecycle.
- R-30 PASS: tidak meniru produk lain atau menambah referensi eksternal.
- R-31 PASS: semua keputusan visual utama memiliki alasan tertulis.

UI skill checklist: PASS pada perubahan ini, didukung gate di atas. Metadata hero tidak menambah kontrol/motion; pemateri tetap data aktual dan foto hanya berada pada kartu pemateri. Tidak ada perubahan pola dashboard atau tabel.

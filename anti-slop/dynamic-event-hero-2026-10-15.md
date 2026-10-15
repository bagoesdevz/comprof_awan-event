# Hero pemateri dinamis, 15 Oktober 2026

Arah: hero detail event untuk calon peserta mengikuti referensi pengguna, bahasa visual Awan Event terang/ungu, ENERGY 2 / RHYTHM 1 / MOTION 2. Judul dan foto pemateri menjadi dua bagian komposisi; panel nama menghubungkan foto dengan identitas. Motif BrandWaves dan lavender dipertahankan karena ada pada referensi dan identitas aplikasi. Animasi terbatas pada badge untuk menandai status acara.

## Implementasi

- Hero menampilkan pemateri dari data admin: foto berwarna, nama, peran/profesi dan institusi. Nama/profesi tidak ditulis ke gambar sehingga tetap dapat diganti pada event berikutnya.
- Admin Materi & pembicara memiliki unggah foto dengan preview, hapus foto dan radio Tampilkan di hero. Semua profil tetap ada di bagian Pemateri. Pemateri pertama selain moderator dipakai bila belum ada pilihan eksplisit. Data lama dengan satu nama tetap didukung.
- `heroFeatured` opsional divalidasi dan tersimpan bersama speakers pada JSON event. Server menolak pilihan ganda dan URL gambar tidak aman. Tidak perlu migrasi atau dependency baru.
- Unggah memakai endpoint admin yang ada, PNG/JPG/WebP maksimal 5 MB. Kontrol pemateri dikunci saat unggah; simpan menunggu unggahan. Error tampil merah dan foto sebelumnya dipertahankan jika unggah gagal. PNG transparan disarankan untuk komposisi seperti referensi; gambar tidak diedit atau dihapus latarnya otomatis.
- Tanpa foto atau saat gagal dimuat, hero memakai skeleton dengan teks. Tanpa profil, poster event yang ada tetap menjadi fallback.
- Badge: biru Akan datang, hijau Sedang berlangsung, netral Selesai. Teks/ikon membedakan status selain warna. Status dihitung dari tanggal mulai dan selesai admin, diperbarui di batas waktu serta saat tab kembali aktif. Animasi masuk satu kali; ikon berlangsung bergerak tiga putaran selama 5,4 detik lalu berhenti. Media prefers-reduced-motion mematikan animasinya.

## Pemeriksaan

- Build produksi final lulus termasuk lint/typecheck dan 48 halaman statis. Peringatan dependency hook ditemukan pada lint awal, diperbaiki sebelum build final.
- Suite 47 tes lulus. Tiga tes baru memeriksa pemilihan pemateri/fallback, penyimpanan flag/foto melalui schema, penolakan pilihan ganda/URL tidak aman dan status tepat pada waktu mulai/selesai.
- Browser memakai EventHero, EventWizard, AdminShell dan jalur readImage asli dengan transport/provider fixture terisolasi. Unggah fixture mengembalikan URL foto publik yang sudah ada; tidak mengunggah file ke Supabase atau mengubah record produksi.
- Mengubah nama dan profesi pemateri kedua, memilihnya melalui Space, unggah foto dan Simpan draft menghasilkan flag/foto/nama/profesi yang sama pada state tersimpan. Pratinjau menampilkan pemateri baru. Pemanggilan check radio dari automation sempat gagal; keyboard Space berhasil dan state tersimpan diverifikasi.
- Hapus foto menghasilkan skeleton pada pratinjau. File selain gambar ditolak dengan pesan format/ukuran. Preview ditutup dengan Escape. Console error aplikasi pada pemeriksaan akhir kosong; log jaringan Statsig dari layanan alat browser terpisah dari aplikasi.
- Hero diuji normal, berlangsung, selesai, foto kosong, foto gagal, judul/nama/profesi panjang dan profil kosong. Total 35 pemeriksaan pada 360/390/768/1024/1440 tanpa horizontal overflow. Filter foto none.
- Admin pada lima viewport tanpa overflow halaman setelah output diagnostik fixture diberi wrap. Overflow awal berasal dari teks URL pada pre fixture, bukan form aplikasi. Navigasi langkah tetap dapat digulir di wadahnya.
- Kontras dari computed styles: Akan datang 7.28:1, berlangsung 6.89:1, selesai 6.92:1; profesi di panel 5.80:1.
- Bukti: `tmp/hero-dynamic-1440.png`, `tmp/hero-dynamic-390.png`, `tmp/hero-qa-results.json`, `tmp/hero-admin-qa.json`. Tanggal, jumlah peserta dan beberapa nama pada fixture diberi label pengujian, bukan perubahan konten produksi.

## Delivery Gate, lingkup perubahan

- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS: 35 pemeriksaan hero dan lima viewport admin tanpa overflow halaman.
- R-17 PASS: jumlah peserta memakai participantCount; angka QA ditandai fixture.
- R-18 PASS: tidak menambah testimonial.
- R-23 PASS: memakai foto dari input admin dan aset brand yang ada; tanpa aset orang rekaan.
- R-24 PASS: tidak menambah navigasi publik.
- R-25 PASS: badge >=6.89:1; profesi 5.80:1.
- R-26 PASS: unggah, hapus, pemilihan, simpan dan preview diperiksa.
- R-27 PASS: pending/error unggah serta foto kosong/gagal memiliki feedback.
- R-28 PASS: FAQ tidak diubah.
- R-32 PASS: Space memilih pemateri, Escape menutup preview, input berlabel.
- R-33 PASS: source diubah memakai apply_patch.
- R-34 PASS: tema/toggle tidak diubah.
- R-35 PASS: build final, 47 tes dan alur browser yang berubah diperiksa.
- R-36 PASS: fixture dan data produksi dibedakan; tidak mengklaim mutasi produksi telah diuji.
- R-37 PASS: arah dari referensi dan dials 2/1/2 dinyatakan.
- R-38 PASS: konten QA berlabel dan tidak dimasukkan ke data produksi.
- R-01 PASS: lavender membingkai portrait sesuai referensi dan palet Awan Event.
- R-04 PASS: kalender, video, clock/radio/check menyatakan jadwal, platform dan status nyata.
- R-06 PASS: font Jakarta/Inter aplikasi dipertahankan, ukuran mengikuti hierarki judul/identitas.
- R-07 PASS: tidak menambah pola grid atau titik dekoratif.
- R-08 PASS: tidak menambah panah tombol.
- R-09 PASS: badge menyatakan lifecycle nyata dengan teks dan ikon.
- R-10 PASS: tanpa backdrop blur baru; identitas memakai permukaan terang.
- R-12 PASS: shadow hanya memisahkan panel identitas yang menumpuk portrait.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: satu pemateri utama sesuai pilihan, profil lainnya tetap pada bagian Pemateri.
- R-19 PASS: animasi hanya status, jumlah putaran terbatas dan reduced motion didukung.
- R-22 PASS: tidak menambah ilustrasi generik; skeleton menandai foto yang belum tersedia.
- Liveliness PASS: dials 2/1/2, judul/foto sebagai fokus, ruang mengelompokkan metadata, lavender dan waves mempertahankan motif brand.
- C-1 PASS: posisi, ukuran dan animasi mengikuti referensi serta kebutuhan identitas/status.
- C-2 PASS: kontrol perubahan data memiliki perilaku dan label yang teruji.
- C-3 PASS: hero menampilkan data event dan narasumber yang diperlukan calon peserta.
- C-4 PASS: lima viewport, teks panjang, gagal gambar dan keyboard diperiksa.
- C-5 PASS: tidak menciptakan klaim pelanggan atau angka produksi.
- R-05 PASS: komposisi mengikuti referensi hero, tidak menambah urutan section template.
- R-11 PASS: radius frame/panel, metadata, badge dan input dibedakan sesuai fungsi.
- R-15 PASS: CTA admin menyebut tindakan Unggah/Hapus foto, Tampilkan di hero, Simpan dan Pratinjau.
- R-16 PASS: label langsung menjelaskan data/tindakan tanpa buzzword.
- R-20 PASS: foto event, brand waves dan tipografi Awan Event dipertahankan.
- R-21 PASS: tema terang yang disetujui dipertahankan.
- R-29 PASS: lavender/ungu menjadi brand; biru/hijau/netral terbatas pada status.
- R-30 PASS: implementasi mengikuti referensi pengguna, tidak meniru produk lain.
- R-31 PASS: alasan komposisi, warna, radius dan motion dijelaskan di atas.
- UI checklist PASS: hirarki, fungsi, responsif, label, keyboard, status, empty/error dan batas motion diperiksa.

Push otomatis mengikuti preferensi pengguna setelah pemeriksaan lulus. Status remote dan deployment dilaporkan dalam jawaban akhir serta handoff lokal.

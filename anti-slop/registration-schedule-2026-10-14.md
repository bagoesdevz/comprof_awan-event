# Jadwal pendaftaran tiket

14 Oktober 2026. Pemeriksaan GET read-only https://awanevent.com/api/platform menemukan event Webinar Pembekalan Kesehatan Reproduksi menuju Pernikahan bagi Gen Z dengan registrationStatus OPEN, tetapi tiket aktif mulai 2026-10-16T08:30:00Z dan berakhir 2026-10-16T09:30:00Z. Dalam WIB, pendaftaran baru mulai 16 Oktober pukul 15.30, sama dengan awal acara. Kuota tersisa 299; kuota bukan penyebab tombol nonaktif. Catatan ini menggambarkan data pada waktu pemeriksaan, bukan janji keadaan database berikutnya.

## Perbaikan lokal

Katalog sekarang menghitung status dari ketersediaan tiket, termasuk tanggal mulai/berakhir, tiket aktif dan kuota. Tombol yang menunggu jadwal menyebut waktu bukanya dalam WIB. Tombol tanpa clock dari parent memperbarui waktu setiap detik, dan pesanan expired tidak mengarahkan pengguna kembali ke pembayaran yang sudah berakhir.

Editor menampilkan penjelasan bahwa jadwal pendaftaran berbeda dari jadwal acara. Buka sekarang menghapus tanggal mulai untuk tiket yang dipilih di form; tanggal akhir, kuota dan status tiket tetap berlaku. Pesan menyatakan bahwa admin harus menyimpan perubahan. Tidak ada perubahan otomatis pada record live. Untuk membuka event yang diperiksa saat ini, admin dapat mengosongkan Pendaftaran mulai di tahap Tiket & pendaftaran lalu menyimpan perubahan.

## Arah dan validasi

Antislop during mengikuti preferensi global yang sudah dipilih dalam percakapan. Brand, tipografi dan layout yang ada dipertahankan. ENERGY 1 / RHYTHM 1 / MOTION 1 untuk tambahan penjelasan editor; tidak ada animasi baru. Ungu tetap untuk tindakan, surface netral mengelompokkan petunjuk jadwal, dan waktu merupakan informasi utama untuk memutuskan kapan pendaftaran dibuka.

- npm run build lulus, termasuk lint/typecheck dan 49 halaman.
- npm run test lulus 25/25, termasuk batas tepat waktu buka, konversi WIB, multi-tiket, expired, inactive, kuota dan penutupan manual.
- tmp/verify-registration-schedule.cjs memakai komponen asli dengan provider fixture; stylesheet dari halaman publik, tanpa mutation API live. Lima viewport 360/390/768/1024/1440 tanpa overflow dan tanpa page error. Katalog/tombol terjadwal sepakat, tautan aktif sampai tujuan login fixture, tombol aktif tanpa refresh saat clock mencapai jadwal, pesanan expired tidak memblokir daftar ulang, dan Buka sekarang berhasil lewat keyboard serta menyimpan hanya penghapusan tanggal mulai. Empat pasangan warna teks baru memiliki kontras minimal 4.5:1.
- git diff --check lulus. Screenshot diperiksa pada tmp/registration-schedule-admin-1440.png; hasil mesin di tmp/registration-schedule-results.json.

## Delivery Gate untuk perubahan ini

- R-02 PASS: teks baru tanpa em dash.
- R-03 PASS: lima viewport tidak overflow.
- R-17 PASS: angka tanggal/kuota pada temuan berasal dari GET live; fixture disebut pengujian.
- R-18 PASS: tidak ada testimonial baru.
- R-23 PASS: tidak ada aset atau identitas baru.
- R-24 PASS: tautan pendaftaran memakai route register/login yang ada, tujuan diperiksa.
- R-25 PASS: empat pasangan teks petunjuk/tombol editor >=4.5:1; disabled native tetap merupakan status tidak interaktif.
- R-26 PASS: Buka sekarang mengubah form dan Simpan draft menyimpan fixture; CTA aktif menuju login.
- R-27 PASS: petunjuk membedakan tanggal mulai kosong/terisi dan pesan perubahan belum disimpan; state provider yang ada dipertahankan.
- R-28 PASS: FAQ tidak diubah.
- R-32 PASS: fokus dan Enter pada Buka sekarang berhasil.
- R-33 PASS: source diubah melalui apply_patch; script hanya untuk QA.
- R-34 PASS: tidak menambah tema atau toggle.
- R-35 PASS: build, 25 tes dan click-through kontrol perubahan lulus.
- R-36 PASS: tidak menyatakan pendaftaran live dibuka, deployment, atau keamanan baru.
- R-37 PASS: arah brand yang ada dan tiga dials tercatat sebelum penambahan layout.
- R-38 PASS: nama/angka fixture jelas pengujian, tanpa data peserta rekaan di aplikasi.
- R-01 PASS: tidak menambah gradient.
- R-04 PASS: tidak menambah ikon.
- R-06 PASS: font brand yang ada dipertahankan.
- R-07 PASS: petunjuk memakai surface netral, tanpa pola dekoratif.
- R-08 PASS: tombol Buka sekarang tanpa panah dekoratif.
- R-09 PASS: label katalog menyatakan status tiket sebenarnya.
- R-10 PASS: tidak menambah glassmorphism.
- R-12 PASS: petunjuk tanpa shadow baru.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: bukan perubahan feature cards.
- R-19 PASS: clock memperbarui keadaan operasional; tidak menambah animasi.
- R-22 PASS: tidak menambah ilustrasi.
- Liveliness PASS: dials 1/1/1, jadwal sebagai fokus, heading/ruang memisahkan petunjuk, aksen dan tipografi memakai identitas editor yang ada.
- C-1 PASS: penjelasan/tanggal ditambahkan karena penyebab tombol nonaktif ditemukan pada data live.
- C-2 PASS: aksi baru dan CTA diperiksa lewat browser.
- C-3 PASS: petunjuk membantu admin menentukan waktu pendaftaran.
- C-4 PASS: form dan tombol bekerja pada lima viewport dan keyboard; pembatas kuota/expiry tidak dihapus.
- C-5 PASS: temuan live dipisahkan dari hasil fixture.
- R-05 PASS: susunan editor yang ada dipertahankan.
- R-11 PASS: radius panel/tombol mengikuti kelas aplikasi.
- R-15 PASS: Buka sekarang menyebut tindakan konkret; tombol terjadwal menyebut waktunya.
- R-16 PASS: teks menjelaskan aturan dan langkah simpan.
- R-20 PASS: identitas Awan Event dipertahankan.
- R-21 PASS: tidak memaksakan tema baru.
- R-29 PASS: warna brand/netral yang ada.
- R-30 PASS: tidak meniru produk lain.
- R-31 PASS: alasan perubahan dan batasnya tercatat di atas.

## Status

Pengguna meminta commit dan push perubahan source ini beserta form pendaftaran ke origin/main pada 14 Oktober 2026. Deployment belum diverifikasi. Server build terbaru tersedia di http://127.0.0.1:3000/. Tidak ada perubahan jadwal atau data event remote selama QA. Pengguna kemudian menyatakan pendaftaran sudah terbuka; konfigurasi jadwal live sesudah pernyataan tersebut tidak diperiksa ulang.

# Grup WhatsApp dan QR event

Permintaan 14 Oktober 2026: tambahkan tautan grup WhatsApp pada editor event, popup untuk peserta setelah pendaftaran tersimpan, serta QR dari tautan event untuk flyer. Anti Slop UI mengikuti palet ungu, surface terang dan font Awan Event yang sudah disetujui. ENERGY 1 / RHYTHM 1 / MOTION 1 untuk kontrol operasional ini. Panel memberi tindakan yang dibutuhkan; tidak menambah bagian pemasaran atau gerakan dekoratif.

## Penggunaan

1. Admin > Event > Edit > Jadwal & akses: isi Tautan grup WhatsApp (opsional) dengan undangan https://chat.whatsapp.com/..., lalu simpan. Event lama tetap kompatibel jika kolom ini tidak ada.
2. Setelah pendaftaran berhasil tersimpan, peserta mendapat popup Gabung grup WhatsApp. Tiket gratis bisa dilanjutkan ke event saya; tiket berbayar tetap menampilkan status belum selesai dan tombol Lanjutkan pembayaran. Menutup popup atau Escape melanjutkan alur yang sama. Tautan WhatsApp dibuka di tab baru atas tindakan peserta.
3. Grup juga tersedia pada halaman dashboard event peserta, sehingga bisa dibuka setelah popup ditutup. Event tanpa grup memakai alur pendaftaran sebelumnya. Pendaftaran gagal tidak membuka popup.
4. Panel QR Code untuk flyer berada di bawah editor. Setelah event disimpan dan published, tersedia pratinjau, Unduh PNG 2048 × 2048 px, Unduh SVG, dan Salin tautan. Revisi berikutnya memakai https://awanevent.com/e/<kode-acak> sesuai `public-event-links-2026-10-14.md`. Draft belum menyediakan unduhan karena URL publiknya belum tersedia.

Tepi putih empat modul serta kontras hitam/putih dipertahankan untuk pembacaan QR. SVG mendukung ukuran cetak; PNG memakai ukuran yang diperiksa langsung dari berkas unduhan. Jangan memotong tepi putih ketika memasukkannya ke desain flyer.

## Penyimpanan dan akses

whatsappGroupUrl adalah field opsional pada ManagedEvent dan schema server. Data tetap disimpan dalam record event JSON yang sudah ada, tanpa migrasi baru. Validasi frontend dan server menolak URL selain undangan HTTPS pada host chat.whatsapp.com, credentials URL, port nonstandar, atau path kosong.

runAction mengembalikan tautan grup setelah commit pendaftaran berhasil. Snapshot menyembunyikan undangan dari pengunjung tanpa registrasi dan peserta event lain. Admin serta pemilik registrasi aktif dapat mengaksesnya; cancelled, expired dan refunded tidak mendapat tautan. Tautan grup tidak menjadi syarat kelulusan, pembayaran atau sertifikat. Joining bukan otomatis: peserta memilih membuka WhatsApp dan bergabung sendiri.

QR memakai dependency qrcode yang sudah terpasang. Tidak menambahkan dependency produksi atau mengirim URL ke layanan generator eksternal. jsQR hanya dipasang pada tmp untuk membaca kembali hasil QA, dan tidak masuk package.json aplikasi.

## Validasi

- Build produksi lulus, 49 halaman dihasilkan. Lint dan TypeScript pada build final lulus; pemeriksaan mandiri juga lulus.
- 17 tes lulus. Tiga tes baru memeriksa schema undangan, penyaringan snapshot berdasarkan pemilik/status registrasi, dan respons registrasi gratis/berbayar setelah commit. Commit gagal tidak mengembalikan ajakan grup.
- Browser pada build produksi, 360/390/768/1024/1440px: editor, panel QR dan popup tidak memiliki overflow dokumen.
- Field undangan tidak valid ditolak; undangan valid tersimpan dalam state event pada fixture menggunakan updater editor asli.
- Draft tidak menyediakan tombol unduh. QR published diunduh sebagai PNG 2048px dan SVG, kemudian keduanya dibaca kembali dengan decoder jsQR dan menghasilkan URL event yang tepat.
- Salin tautan berhasil dibaca dari clipboard. Ketika clipboard ditolak, kolom tautan tetap bisa dipilih untuk disalin manual. Kegagalan generator QR dan tombol Buat ulang QR diuji sampai pratinjau pulih.
- Registrasi gratis dan berbayar membuka popup setelah respons sukses, termasuk ketika provider menambahkan registrasi ke snapshot. URL WhatsApp diuji membuka tab baru melalui intercept, tanpa bergabung pada grup nyata. Escape, containment fokus dan tombol lanjut diuji.
- Tanpa tautan grup, tujuan navigasi sebelumnya tetap digunakan. Respons registrasi gagal tidak memunculkan popup atau navigasi sukses.
- Tautan grup pada halaman peserta tersedia setelah registrasi, dan tidak ditampilkan tanpa registrasi atau setelah pembatalan.
- 100 pemeriksaan teks dari computed styles panel QR/popup lulus minimal 4.5:1. Tidak ada page error browser.
- git diff --check lulus. Bukti: tmp/event-sharing-results.json dan tmp/verify-event-sharing.cjs; screenshot event-sharing-admin-1440.png, event-sharing-free-390.png, event-sharing-paid-390.png; berkas QR uji event-flyer-qr.png dan event-flyer-qr.svg. Semua nama/undangan pengujian adalah fixture, tidak disimpan pada source produksi.

## Delivery Gate

Gate berikut berlaku pada fitur ini, bukan sertifikasi seluruh aplikasi.

### Hard Gate

- R-02 PASS: copy baru tidak memakai em dash.
- R-03 PASS: lima viewport diuji; panel QR dan modal reflow tanpa overflow dokumen.
- R-17 PASS: ukuran PNG berasal dari konfigurasi dan diverifikasi decoder; tidak menambah statistik pemasaran.
- R-18 PASS: tidak menambah testimoni atau avatar.
- R-23 PASS: QR diminta pengguna; tidak membuat foto/logo atau grup rekaan untuk produksi.
- R-24 PASS: URL QR menggunakan route event yang ada; navigasi lanjut memakai dashboard event atau checkout yang sudah ada.
- R-25 PASS: 100 pemeriksaan teks minimal 4.5:1; QR hitam/putih berhasil dibaca.
- R-26 PASS: unduhan, copy, retry, link grup, close dan lanjut dijalankan di browser.
- R-27 PASS: draft, QR loading/error, clipboard gagal, registrasi gagal dan pembayaran pending memiliki state sesuai.
- R-28 PASS: tidak menambahkan FAQ.
- R-32 PASS: Radix mengelola fokus modal dan Escape; close 44px; input mempunyai accessible name serta petunjuk.
- R-33 PASS: TSX/CSS ditulis melalui patch; script hanya untuk QA.
- R-34 PASS: tema terang aplikasi dipertahankan, tanpa theme toggle tambahan.
- R-35 PASS: build final berhasil; browser dijalankan pada server produksi lokal dan tanpa page error.
- R-36 PASS: tidak menambah klaim keamanan atau pengiriman pesan otomatis.
- R-37 PASS: arah operasional dan identitas Awan Event dinyatakan sebelum implementasi.
- R-38 PASS: fitur menggunakan event tersimpan; tautan grup tetap kosong jika admin tidak mengisi.

### Purpose-Gate

- R-01 PASS: ungu untuk tindakan, putih untuk dialog dan quiet zone QR; tanpa gradient.
- R-04 PASS: MessageCircle menandai grup, Download unduhan, Copy penyalinan, X penutupan dan QrCode jenis hasil.
- R-06 PASS: font brand dipertahankan; teks petunjuk 14px, tanpa label monospace dekoratif.
- R-07 PASS: tidak menambah pola background.
- R-08 PASS: tidak menambah panah pada seluruh tombol.
- R-09 PASS: tidak menambahkan capsule badge pemasaran.
- R-10 PASS: overlay solid transparan tanpa blur tambahan.
- R-12 PASS: shadow hanya menegaskan dialog di atas halaman, panel QR mengikuti panel admin biasa.
- R-13 PASS: tidak ada glow.
- R-14 PASS: satu panel untuk pekerjaan berbagi event; tidak menambah grid kartu fitur.
- R-19 PASS: tidak ada motion berulang; skeleton/generator memakai status teks.
- R-22 PASS: tidak menambah ilustrasi generik.

### Liveliness

- Dials PASS: ENERGY 1 / RHYTHM 1 / MOTION 1 untuk form dan konfirmasi operasional.
- Consistency PASS: panel terang, aksi ungu dan konten pendek sesuai dials.
- Focal point PASS: Gabung grup WhatsApp pada popup; QR dan unduhan pada panel admin.
- Whitespace PASS: ruang memisahkan status pembayaran dari tindakan dan petunjuk.
- Accent PASS: ungu brand sebagai aksi; warna amber hanya menandai pembayaran belum selesai.
- Identity PASS: warna dan font Awan Event dipakai bersama komponen aplikasi.
- Design Read PASS: tujuan form, popup dan QR dijelaskan sebelum implementasi.

### Craftsmanship dan Quality Locks

- C-1 PASS: alasan warna, ikon, overlay dan QR dicatat di atas.
- C-2 PASS: semua kontrol baru memiliki handler/href yang diuji.
- C-3 PASS: hanya menambahkan pekerjaan pengaturan grup, konfirmasi dan berbagi event.
- C-4 PASS: error, kosong/draft, gratis/berbayar, keyboard dan lima viewport diuji.
- C-5 PASS: tidak menambah bukti sosial atau identitas palsu.
- R-05 PASS: mengikuti struktur editor/registrasi yang ada, tanpa template landing baru.
- R-11 PASS: dialog 24px, panel dan field mengikuti radius aplikasi; tidak semua elemen dibuat pill.
- R-15 PASS: tombol menyebut Gabung grup, Lanjutkan pembayaran, Unduh PNG/SVG dan Salin tautan.
- R-16 PASS: copy menjelaskan tindakan dan status, tanpa jargon pemasaran.
- R-20 PASS: identitas ungu dan font aplikasi dipertahankan.
- R-21 PASS: tidak memaksakan dark mode; QR putih untuk kebutuhan pembacaan.
- R-29 PASS: palet terbatas pada brand, netral dan status pending.
- R-30 PASS: memakai sistem aplikasi yang ada, bukan meniru produk lain.
- R-31 PASS: alasan keputusan besar tercatat di bagian penggunaan dan penyimpanan.

## Status

Pengguna meminta commit dan push revisi ini ke origin/main pada 14 Oktober 2026; deployment belum diverifikasi. Server produksi lokal berjalan pada port 3000. Uji browser memakai komponen asli dan stylesheet hasil build dengan provider/navigasi fixture; test server memakai penyimpanan terisolasi. Tidak ada pendaftaran, pembayaran atau pesan nyata dijalankan dan tidak ada perubahan database remote. Aktif/tidaknya undangan WhatsApp yang nanti diisi admin tidak bisa dipastikan hanya dari bentuk URL.

# Tautan publik event dengan kode acak

Permintaan 14 Oktober 2026: setiap event mendapat tautan yang tidak lagi memakai slug contoh. Implementasi memakai https://awanevent.com/e/<kode>, dengan 16 byte dari node:crypto randomBytes yang disimpan sebagai 32 karakter hex pada field publicCode. Kode dibuat oleh server. Ini alamat publik untuk dibagikan melalui flyer, bukan pengganti login atau izin akses peserta.

## Perilaku

- Event baru memperoleh publicCode saat disimpan melalui API. Schema tidak menerima kode pilihan dari client; server membuat kode baru atau mempertahankan kode record lama.
- Saat admin yang terautentikasi membuka admin, action ensure-event-links mengisi kode untuk event lama yang belum memiliki kode valid. Akses dibatasi dengan requireAdmin, Origin dan rate limiter pada endpoint action yang sudah ada. Pengerjaan dibagi per 100 record dan menggunakan revision guard commit yang sudah tersedia.
- Inisialisasi berulang tidak mengganti kode valid. Pengubahan judul dan penyimpanan ulang juga mempertahankan kode, ID event dan slug internal.
- Event baru memakai UUID yang tetap selama sesi editor. Setelah draft pertama tersimpan, editor mengikuti record itu; penyimpanan kedua tidak membuat ID baru atau menggandakan event.
- QR, beranda, kartu katalog, tombol Lihat di admin dan tautan rekomendasi peserta mengikuti alamat baru setelah kode tersedia. Event yang belum diinisialisasi masih bisa dibuka lewat alamat lama.
- Endpoint /e/<kode> hanya merender event published. Middleware memeriksa format kode dan hanya meminta id record yang memenuhi status published pada metadata dan JSON. Server page memeriksa ulang status dan mengirim hanya slug kepada komponen client, tanpa mengirim record privat sebagai props.
- Kode salah/tidak ada ditolak dengan HTTP 404 dan halaman fallback yang dapat kembali ke katalog. Kegagalan layanan memakai 503. Respons error langsung dari middleware menjaga status HTTP sebelum streaming halaman Next.js dan mempunyai Cache-Control private, no-store serta CSP tanpa script.
- Slug pada registrasi, checkout, dashboard, sertifikat dan data lama tidak diganti. Tautan /events/<slug> tetap bekerja. Tidak perlu migrasi SQL; kode tambahan memakai record JSON yang sudah ada.

## Validasi

- Build produksi final berhasil: 49 halaman statis dan route dinamis /e/[code]. Lint dan pemeriksaan TypeScript di build final lulus; pemeriksaan mandiri juga lulus.
- 22 tes lulus. Tes baru mencakup otorisasi sebelum membaca record, inisialisasi 102 event dalam batch 100+2, kode unik pada dataset uji, idempotensi, kode client diabaikan, kode tetap saat judul berubah, penolakan kode tidak valid/draft, query middleware yang hanya memilih id, status layanan gagal dan respons error tanpa script.
- Browser dengan komponen asli dan provider fixture pada 360/390/768/1024/1440px: tautan lama diinisialisasi melalui action admin, tombol retry bekerja, mengubah judul tidak mengubah alamat, dan draft baru disimpan berulang tanpa mengganti ID/kode/slug atau menambah duplikat.
- PNG 2048px dan SVG hasil unduhan dibaca kembali menggunakan jsQR dan menghasilkan URL https://awanevent.com/e/<kode-fixture> yang tepat. Clipboard, generator error/retry dan fitur WhatsApp dari perubahan sebelumnya tetap lolos.
- 100 pemeriksaan teks pada panel QR/popup lulus 4.5:1; tidak ada page error pada fixture. Tautan ditampilkan pada field readonly yang bisa dipilih, bukan dipotong.
- HTTP read-only pada server produksi lokal: /e/invalid-code dan kode tidak ada mengembalikan 404; /events/contoh-webinar-awan-event tetap 200. Halaman fallback diuji pada lima viewport tanpa overflow dan tombol katalog berhasil membuka /events.
- git diff --check lulus. Bukti tersimpan di tmp/event-sharing-results.json, tmp/public-link-errors.json, tmp/public-link-error-390.png dan tests/public-event-links.test.cjs.

Pemeriksaan otomatis menolak percobaan menjalankan server QA dengan konfigurasi backend terisolasi, dengan alasan blocked by policy. Lookup positif event published diuji melalui mock penyimpanan pada tes server; HTTP end-to-end positif /e/<kode> terhadap database remote belum diuji. Inisialisasi remote untuk seluruh event juga belum dijalankan tanpa sesi admin. Tidak ada perubahan konfigurasi backend atau bypass autentikasi diterapkan untuk pemeriksaan ini.

## Delivery Gate

Arah operasional mengikuti ungu, logo dan surface terang Awan Event. ENERGY 1 / RHYTHM 1 / MOTION 1. Gate berlaku pada perubahan tautan dan error state, bukan audit keamanan seluruh aplikasi.

### Hard Gate

- R-02 PASS: teks baru tidak memakai em dash.
- R-03 PASS: panel dan error state diuji pada lima viewport tanpa overflow.
- R-17 PASS: entropy berasal dari 16 byte CSPRNG; tidak menambah angka pemasaran.
- R-18 PASS: tidak menambahkan testimoni atau avatar.
- R-23 PASS: tautan/QR diminta pengguna; logo error state memakai aset asli.
- R-24 PASS: /e/[code] terimplementasi, katalog kembali bekerja, dan route lama tetap 200.
- R-25 PASS: 100 pasangan teks QR/popup lulus; error state memakai token teks/primary yang sudah diverifikasi.
- R-26 PASS: inisialisasi/retry, simpan, unduhan dan salin tautan dijalankan di browser fixture; katalog error state diklik pada server lokal.
- R-27 PASS: alamat belum dibuat, draft, salah/tidak ada, kegagalan query dan QR error mempunyai state sesuai.
- R-28 PASS: tidak menambahkan FAQ.
- R-32 PASS: field readonly tetap fokus/seleksi; tombol katalog dan kontrol menggunakan elemen native dengan focus indicator.
- R-33 PASS: perubahan source menggunakan patch; script QA tidak menulis ulang source.
- R-34 PASS: tema terang dipertahankan.
- R-35 PASS: build, 22 tes, browser dan pemeriksaan HTTP lokal tercatat beserta batasnya.
- R-36 PASS: tidak mengklaim kode publik sebagai otorisasi atau seluruh aplikasi aman.
- R-37 PASS: mengikuti alur admin dan sistem visual yang sudah dimuat dalam percakapan ini.
- R-38 PASS: record event berasal dari backend; kode contoh pada QA hanya fixture.

### Purpose-Gate

- R-01 PASS: ungu solid untuk tindakan, tanpa gradient.
- R-04 PASS: ikon download/copy/QR tetap menunjukkan tindakan; error state hanya memakai logo.
- R-06 PASS: font brand pada panel; system font pada respons error mandiri agar tidak memerlukan bundle/font eksternal.
- R-07 PASS: tidak menambahkan pola background.
- R-08 PASS: tidak menambahkan panah dekoratif.
- R-09 PASS: tidak menambahkan badge Secure atau klaim sejenis.
- R-10 PASS: surface solid tanpa blur baru.
- R-12 PASS: error state tanpa shadow; panel QR mengikuti surface admin.
- R-13 PASS: tidak ada glow.
- R-14 PASS: satu panel untuk berbagi event, bukan grid fitur pemasaran.
- R-19 PASS: tidak ada motion berulang.
- R-22 PASS: tidak menambahkan ilustrasi stok.

### Liveliness

- Dials PASS: ENERGY 1 / RHYTHM 1 / MOTION 1 sesuai pekerjaan operasional.
- Consistency PASS: kontrol mengikuti panel admin dan error state sederhana.
- Focal point PASS: tautan/QR pada editor dan tindakan kembali ke katalog pada error.
- Whitespace PASS: ruang memisahkan judul, informasi dan tindakan.
- Accent PASS: ungu menandai tindakan, tidak seluruh background.
- Identity PASS: logo, palet dan komponen Awan Event dipakai kembali.
- Design Read PASS: arah dan format tautan dinyatakan sebelum perubahan.

### Craftsmanship dan Quality Locks

- C-1 PASS: alasan kode terpisah, preservasi slug dan respons langsung tercatat.
- C-2 PASS: kontrol baru teruji; query published diuji pada server dan penolakan HTTP lokal.
- C-3 PASS: perubahan melayani permintaan tautan setiap event, tanpa section tambahan pemasaran.
- C-4 PASS: draft, salah/tidak ada, error layanan, judul berubah, lima viewport dan retry diuji.
- C-5 PASS: tidak menambah klaim/testimoni palsu.
- R-05 PASS: struktur editor dipertahankan.
- R-11 PASS: radius dan tombol mengikuti aplikasi; error native memakai radius tombol 12px.
- R-15 PASS: tindakan menyebut Buat tautan event dan Buka katalog event.
- R-16 PASS: copy menggunakan tindakan/status langsung.
- R-20 PASS: identitas Awan Event dipertahankan.
- R-21 PASS: tidak menambahkan dark mode.
- R-29 PASS: palet terbatas pada warna brand dan netral.
- R-30 PASS: tidak menyalin produk lain.
- R-31 PASS: keputusan besar dan batas pemeriksaan dijelaskan.

## Aktivasi

Pengguna meminta commit dan push source ini ke origin/main pada 14 Oktober 2026; deployment belum diverifikasi. Setelah versi ini diterapkan dan admin masuk, event lama otomatis mendapat kode; event baru mendapat kode saat disimpan. Bila inisialisasi belum selesai atau gagal, panel QR menyediakan Buat tautan event untuk mencoba lagi. Route /e/<kode> di awanevent.com memerlukan deployment kode terbaru sebelum QR produksi digunakan. Tidak ada pendaftaran, pembayaran atau perubahan record remote dijalankan selama QA.

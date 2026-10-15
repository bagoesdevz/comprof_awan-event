# Akses grup WhatsApp peserta, 15 Oktober 2026

Pengguna melaporkan grup tidak muncul setelah mendaftar maupun di Event saya. Pemeriksaan source menemukan akses ulang hanya di bawah seluruh detail event; kartu Event saya, halaman registrasi yang sudah tersimpan dan checkout belum menyediakan akses grup. Popup bergantung sepenuhnya pada tautan dalam result action, tanpa fallback snapshot. Event tanpa tautan disembunyikan tanpa keterangan.

Status tautan pada record produksi yang dilaporkan belum dikonfirmasi: nama event dan status kolom admin ditanyakan, belum dijawab saat pengujian selesai. Tidak menganggap temuan source sebagai bukti penyebab record tersebut. GitHub CLI tidak memiliki sesi autentikasi untuk membaca status deployment; tidak ada deployment produksi yang diklaim terverifikasi.

## Perubahan

- EventGroupAccess memiliki mode compact untuk tombol pada kartu Event saya dan dashboard. Panel lengkap dipindahkan ke atas detail event, serta dipasang pada registrasi tersimpan dan halaman pembayaran, termasuk route status yang memakai halaman pembayaran yang sama.
- Pemilik registrasi aktif dapat membuka grup kembali. Pembandingan email dalam komponen grup mengikuti server, tanpa membedakan huruf besar/kecil. Izin server tidak diubah: tamu, event lain serta cancelled/expired/refunded tidak mendapat undangan.
- Panel lengkap menunjukkan keterangan jika tautan belum tersedia. Tombol compact tidak dibuat ketika URL kosong/tidak valid.
- Setelah register berhasil, URL dalam result dipakai terlebih dahulu. Jika tidak ada/invalid, refresh mengambil snapshot baru dan popup memakai URL event yang sudah diizinkan server. Tanpa URL, alur tetap menuju event/pembayaran.
- Admin tetap perlu menyimpan undangan HTTPS chat.whatsapp.com pada Jadwal & akses. Tidak membuat grup WhatsApp baru atau mengisi undangan rekaan pada data aplikasi.

## Arah dan alasan

Reading this as: alur operasional peserta Awan Event, mengikuti identitas ungu dan surface terang yang disetujui; ENERGY 1 / RHYTHM 1 / MOTION 1.

Tombol grup berdampingan dengan Buka event agar dapat ditemukan dari kartu yang digunakan peserta. Panel ditempatkan awal detail agar tidak tersembunyi setelah aktivitas. Tombol sekunder menjaga hierarki Buka event/pembayaran; ikon percakapan menandai tujuan komunikasi. Font, radius, warna dan jarak memakai komponen aplikasi, tanpa dekorasi atau animasi baru. Keterangan kosong menjelaskan kondisi tanpa tombol mati.

## Pengujian dan batas

- Build produksi final lulus, termasuk lint dan typecheck, 49 halaman statis dihasilkan.
- npm test: 37/37 lulus. Regresi baru mencakup kartu/panel untuk paid/pending, email berbeda kapitalisasi pada komponen grup, penolakan tamu/pemilik lain/status nonaktif, serta undangan kosong/invalid tanpa tombol mati. Setelah menambah assertion akses pada registrasi tersimpan, kelima tes registration-profile diulang dan lulus.
- Browser memakai PlatformProvider, EventWizard, RegistrationWizard, ParticipantWorkspace, Checkout dan EventGroupAccess asli; transport dan routing berupa fixture berlabel yang hanya menyimpan state dalam memori.
- Register gratis dengan result tanpa URL melakukan refresh dan membuka popup yang berisi undangan dari snapshot. Escape melanjutkan ke detail event; kartu Event saya dan membuka ulang registrasi tetap memberikan undangan.
- Editor admin menyimpan undangan baru UpdatedFixtureInvite123; setelah berpindah ke peserta baru dan mendaftar, popup menunjukkan URL baru yang sama. Tidak ada data produksi diubah.
- Tiket berbayar menampilkan popup dengan status belum lunas; Lanjutkan pembayaran menuju checkout pending yang masih memiliki akses grup. Fixture pricingMode sempat tidak sesuai price, dikoreksi sebelum hasil berbayar dinyatakan lulus.
- Tanpa tautan, register tetap sukses tanpa popup grup dan detail memberi keterangan. Respons register gagal menampilkan error, tanpa popup/dialog dan tanpa link grup.
- Popup dan kartu pada 360/390/768/1024/1440 tidak horizontal overflow. Screenshot 390 diperiksa secara visual. Tombol grup kartu tinggi 46px.
- Kontras dari computed styles: tombol #241656 pada putih 15.86:1, teks status #5D607D pada putih 6.11:1.
- href undangan, target=_blank dan rel=noopener noreferrer diperiksa dari DOM. Tidak membuka atau bergabung pada grup sungguhan, tidak menjalankan pembayaran.
- Bukti lokal: tmp/group-popup-1440.png, tmp/group-popup-390.png, tmp/group-access-card-1440.png dan tmp/group-access-card-390.png. Tab dan server fixture 4024 dihentikan sesudah QA.
- git diff --check lulus. Tidak ada schema/migrasi atau dependency baru.

## Delivery Gate, lingkup perubahan akses grup

- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS: popup/kartu pada lima viewport tanpa overflow.
- R-17 PASS: tidak menambah statistik pemasaran.
- R-18 PASS: tidak menambah testimonial.
- R-23 PASS: tanpa aset baru; undangan fixture berlabel, tidak disimpan ke produksi.
- R-24 PASS: route register/event/pembayaran yang ada dipakai; tujuan tautan diperiksa.
- R-25 PASS: pasangan warna baru/terpakai 15.86:1 dan 6.11:1.
- R-26 PASS: submit, Escape, lanjut pembayaran, simpan admin, akses ulang teruji; href grup terverifikasi.
- R-27 PASS: undangan kosong dan register gagal memberi status; tidak ada popup sukses pada kegagalan.
- R-28 PASS: FAQ tidak diubah.
- R-32 PASS: submit Enter dan Escape teruji, label native serta fokus dialog dipertahankan.
- R-33 PASS: source memakai apply_patch.
- R-34 PASS: tema/toggle tidak diubah.
- R-35 PASS: build final, 37 tes dan browser alur gratis/berbayar/fallback/kosong/error lulus.
- R-36 PASS: produksi yang belum diperiksa dibedakan dari hasil fixture.
- R-37 PASS: arah operasional dan dials tercatat.
- R-38 PASS: data buatan hanya di fixture pengujian berlabel.
- R-01 PASS: tidak menambah gradient.
- R-04 PASS: ikon percakapan terkait langsung dengan grup.
- R-06 PASS: font aplikasi dipertahankan untuk konsistensi.
- R-07 PASS: tanpa pola latar baru.
- R-08 PASS: tidak menambah panah dekoratif.
- R-09 PASS: tidak menambah badge.
- R-10 PASS: tidak menambah glassmorphism.
- R-12 PASS: tidak menambah shadow.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: tombol menjadi tindakan pada kartu event yang sudah ada.
- R-19 PASS: tidak menambah animasi.
- R-22 PASS: tidak menambah ilustrasi.
- Liveliness PASS: dials 1/1/1; judul event dan aksi utama tetap fokus, aksen brand dan motif kontrol dipertahankan, jarak memisahkan tindakan/status.
- C-1 PASS: penempatan dan hierarki tombol punya alasan di atas.
- C-2 PASS: tautan valid saja menjadi tombol; akses ulang dan fallback teruji.
- C-3 PASS: panel/tombol menyelesaikan kebutuhan komunikasi peserta.
- C-4 PASS: lima viewport, keyboard, kosong dan gagal diuji.
- C-5 PASS: tidak mengklaim bergabung, pembayaran atau deployment produksi.
- R-05 PASS: struktur kartu dan wizard yang ada dipertahankan.
- R-11 PASS: radius kontrol mengikuti aplikasi.
- R-15 PASS: CTA menyebut Gabung grup WhatsApp.
- R-16 PASS: status dan tindakan memakai bahasa langsung.
- R-20 PASS: identitas Awan Event dipertahankan.
- R-21 PASS: tema terang operasional yang ada dipertahankan.
- R-29 PASS: token brand dan netral yang ada digunakan.
- R-30 PASS: tidak meniru produk lain.
- R-31 PASS: keputusan penempatan, tipografi, warna dan jarak tercatat.
- UI checklist PASS: komposisi mengikuti tugas peserta, tanpa dekorasi/data rekaan produksi, kontrol dan status sesuai kondisi, responsif/keyboard diuji.

## Status

Pengguna telah meminta otomatis push setelah selesai dan pemeriksaan lulus. Perubahan ini disiapkan untuk origin/main. Deployment dan konfigurasi undangan pada event produksi belum diverifikasi.

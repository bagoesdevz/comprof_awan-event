# Kartu tiket, jadwal dan tombol, 15 Oktober 2026

Pengguna meminta kartu tiket lebih besar, timeline lebih jelas, dan tanda panah di semua tombol dihilangkan, dengan screenshot kartu tiket sebagai acuan.

## Hasil dan alasan

Reading this as: detail tiket event untuk peserta Awan Event, mengikuti identitas ungu, surface terang dan tipografi aplikasi yang disetujui; ENERGY 1 / RHYTHM 1 / MOTION 1.

- Lebar maksimum kelompok tiket naik dari 920 ke 1080px. Padding desktop 36px, ponsel 24px; judul 24–28px, harga 36–48px, kuota 40–56px. Hierarki menonjolkan pilihan tiket dan harga.
- Dua kelompok timeline memisahkan Jadwal pendaftaran dan Pelaksanaan event. Empat label eksplisit: Pendaftaran dibuka, Pendaftaran ditutup, Acara dimulai, Acara selesai. Label 14px dan tanggal/jam 16px menggantikan periode 10px yang ambigu. Semua waktu ditampilkan dalam WIB dan elemen time memakai timestamp asli.
- Pembukaan kosong dijelaskan sebagai sejak publikasi. Penutupan kosong mengikuti endAt acara, sesuai aturan server yang sudah ada. Tidak menebak tanggal publikasi atau membuat jadwal baru.
- Summary memakai flex wrap agar harga berbayar mendapat ruang utuh saat panel kuota tidak lagi muat di sampingnya. Kelompok manfaat tidak dirender jika kosong, sehingga tidak menyisakan separator kosong.
- ArrowLeft/Right/UpRight, ikon SVG panah dan chevron di tombol/link tindakan publik, admin dan peserta dihapus dari source. Tidak mengubah href, handler, aturan waktu, auth atau pembayaran.
- Kontrol ikon saja memperoleh teks: Detail pada kartu lama, Sebelumnya/Berikutnya pada galeri dan carousel, Naik/Turun pada pengurutan bagian. Pengurutan membungkus ke baris berikutnya pada ponsel agar label tetap muat. Sidebar dan FAQ memakai tanda tambah yang berubah saat dibuka. Keyboard panah tetap berfungsi pada galeri/carousel; separator breadcrumb berada di luar tombol.
- Palet, font dan fokus memakai aplikasi yang ada. Titik dan garis timeline menandai awal/akhir periode, tanpa aset atau animasi dekoratif baru.

## Validasi

- Build produksi final lulus, termasuk lint/typecheck dan 49 halaman statis. Build awal sempat membaca fixture yang belum selesai ditulis; syntax fixture diperbaiki sebelum build final.
- npm test: 37 tes lulus. Tidak menambah tes unit untuk penghapusan ikon atau CSS; verifikasi perilaku dilakukan di browser.
- Browser fixture menggunakan komponen asli EventPricingSection, EventAction, EventFaqSection, EventWizard, AdminShell, AppSidebar, GalleryLightbox, CircularTestimonials dan EventCard, dengan state/routing pengujian terisolasi. Tidak ada perubahan data produksi, transaksi atau pembukaan layanan eksternal.
- Delapan mode (gratis, berbayar, dua paket, tanggal kosong, belum dibuka, penuh, ditutup dan tanpa tiket) pada 360/390/768/1024/1440: 40 pemeriksaan tanpa horizontal overflow. Harga Rp250.000 dan Rp1.250.000 tidak overflow. Pemotongan harga akibat summary dua kolom ditemukan di ponsel, diperbaiki dan diperiksa ulang secara visual.
- Tanggal kosong, waktu pembukaan di masa depan, tombol ditutup, tautan daftar tunggu dan keadaan tiket kosong menampilkan status yang sesuai. CTA gratis menuju login dengan next register dan ID tiket; Detail menuju kode publik event yang sama.
- Admin pada lima viewport tidak overflow dan tidak memiliki tombol tanpa nama. Sidebar dapat dibuka, Naik/Turun mengubah posisi Pembuka dan memulihkannya, editor bagian terbuka, Edit Informasi program, Lanjut via Enter dan Kembali berfungsi.
- Galeri berpindah foto melalui kedua tombol teks dan ditutup dengan Escape. Carousel berpindah ke item kedua dan kembali. FAQ terbuka melalui Enter. Data gambar fixture awal memakai URL kembar sehingga React memperingatkan key duplikat; fixture diberi identitas URL unik lalu galeri diuji ulang tanpa error console.
- Dua puluh pasangan teks kartu dari computed styles: rasio terendah 5.10:1, tertinggi 16.66:1. Label timeline 14px dan nilai 16px terverifikasi pada kelima viewport.
- Pencarian source memastikan sisa nama Arrow hanya handler keyboard, dan ChevronRight hanya separator breadcrumb di luar tombol/link. Tidak ada CSS yang sekadar menyembunyikan ikon untuk menyisakan tombol kosong.
- Screenshot final: tmp/ticket-layout-1440.png dan tmp/ticket-layout-390.png. Tab/viewport/server fixture 4025 dibersihkan setelah QA. Fixture berlabel, angka dan tanggalnya bukan data produksi.
- git diff --check lulus. Tidak ada model, migrasi atau dependency baru.

## Delivery Gate, lingkup perubahan ini

- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS: 40 kasus tiket dan lima viewport admin tanpa overflow.
- R-17 PASS: kuota/harga berasal dari state; angka pengujian diberi label fixture.
- R-18 PASS: tidak menambahkan testimonial produksi.
- R-23 PASS: tidak membuat aset produksi; menggunakan logo yang ada hanya untuk QA galeri.
- R-24 PASS: href daftar, daftar tunggu dan detail tetap nyata dan diperiksa.
- R-25 PASS: seluruh 20 pasangan teks kartu >=5.10:1.
- R-26 PASS: CTA, pengurutan, editor, sidebar, galeri, carousel dan FAQ teruji.
- R-27 PASS: jadwal kosong, scheduled/full/closed dan tiket kosong diperiksa; state loading/error aplikasi tidak diubah.
- R-28 PASS: FAQ tetap menjelaskan pendaftaran, akses, kuota dan sertifikat event.
- R-32 PASS: Enter dan Escape teruji; handler keyboard panah dipertahankan.
- R-33 PASS: perubahan source memakai apply_patch, tanpa penyuntingan source lewat skrip.
- R-34 PASS: tema/toggle tidak diubah.
- R-35 PASS: build final, 37 tes, pemeriksaan source dan browser untuk kontrol yang berubah lulus.
- R-36 PASS: hasil fixture dibedakan dari deployment produksi yang belum diverifikasi.
- R-37 PASS: arah dan dials operasional dinyatakan.
- R-38 PASS: konten rekaan pengujian berada di fixture berlabel saja.
- R-01 PASS: tidak menambahkan gradient.
- R-04 PASS: ikon panah tindakan dihapus; ikon fungsi lain tetap terkait tugas.
- R-06 PASS: font aplikasi dipertahankan; ukuran diperbesar untuk keterbacaan.
- R-07 PASS: tidak menambahkan pola latar.
- R-08 PASS: tombol/link tindakan tidak memakai panah dekoratif.
- R-09 PASS: badge yang ada menyatakan status/ketersediaan nyata.
- R-10 PASS: tidak menambah glassmorphism.
- R-12 PASS: tidak menambah shadow.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: kartu sesuai paket yang tersedia, tanpa kartu fitur baru.
- R-19 PASS: tidak menambah animasi; transisi buka/tutup mengikuti keadaan kontrol.
- R-22 PASS: tidak menambah ilustrasi.
- Liveliness PASS: dials 1/1/1; harga dan CTA menjadi fokus, jarak memisahkan dua jadwal, aksen ungu dan tipografi mempertahankan identitas.
- C-1 PASS: alasan ukuran, wrap, timeline dan label teks tercatat.
- C-2 PASS: pengganti ikon punya nama, tujuan dan perilaku yang diuji.
- C-3 PASS: empat waktu menjawab kebutuhan pemilihan tiket peserta.
- C-4 PASS: harga panjang, multi tiket, status, keyboard dan ponsel diuji.
- C-5 PASS: tidak mengklaim data/deployment produksi sudah diperiksa.
- R-05 PASS: struktur kartu event mengikuti data dan pilihan kehadiran yang ada.
- R-11 PASS: radius kartu dan kontrol memiliki skala yang konsisten.
- R-15 PASS: aksi menyebut Daftar gratis, Detail, Naik/Turun dan Sebelumnya/Berikutnya.
- R-16 PASS: label jadwal menyebut fungsi waktu secara langsung.
- R-20 PASS: identitas Awan Event dipertahankan.
- R-21 PASS: tema operasional terang yang disetujui tetap digunakan.
- R-29 PASS: palet brand dan netral tetap konsisten.
- R-30 PASS: tidak meniru produk lain.
- R-31 PASS: alasan visual dan perilaku tercatat di atas.
- UI checklist PASS: hierarki, aksen, fungsi, label, keyboard dan responsif diperiksa; tanpa dekorasi atau data pemasaran baru.

## Status

Push otomatis ke origin/main mengikuti izin pengguna setelah pemeriksaan lulus. Deployment produksi belum diverifikasi.

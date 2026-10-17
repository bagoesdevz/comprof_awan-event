# E-tiket Awan Event

Status: PASS. Design Read: pengguna meminta tiket hanya untuk pendaftaran berbayar atau kegiatan offline, tombol Unduh tiket, serta desain modern dengan warna/aksen Awan Event. ENERGY 1 / RHYTHM 1 / MOTION 1. Tiket harus mudah dibaca, disimpan di ponsel dan diperiksa saat check-in.

## Perilaku dan keputusan

- E-tiket/QR ditampilkan untuk pendaftaran berstatus paid dengan harga saat pendaftaran lebih dari nol, kehadiran ONSITE, atau event ONSITE. Gratis online tidak menerbitkan e-tiket. Pada hybrid, peserta online gratis tidak memperoleh e-tiket; peserta tatap muka mendapatkannya. Pending, gagal, dibatalkan, kedaluwarsa dan refunded tidak mendapat tiket aktif.
- Kode pendaftaran internal tetap dipertahankan bagi seluruh peserta untuk alur kelas, pembayaran dan sertifikat. Pembatasan berlaku pada e-tiket/QR dan unduhannya; akses webinar gratis online tetap melalui Kelas saya. Uji memastikan pencatatan kehadiran online peserta gratis tetap berjalan.
- Harga satuan disimpan sebagai ticketPrice pada pendaftaran baru, termasuk anggota grup yang amount-nya nol karena dibayar pemesan. Perubahan harga event sesudah pembelian tidak mengubah kelas tiket yang sudah dibeli. Pendaftaran lama memakai jumlah transaksi historis; anggota grup lama memperoleh harga satuan dari order induk yang cocok. Snapshot memperkaya field tersebut tanpa menulis ulang catatan atau mengekspos identitas pemesan kepada anggota grup. Lookup order lama dicache per snapshot.
- Helper admission-ticket dipakai UI, endpoint dan validasi check-in. Endpoint GET /api/tickets/[id] memerlukan sesi, kode valid, kepemilikan akun dan pendaftaran yang memenuhi syarat. Order induk grup harus cocok dan lunas. Respons private/no-store hanya memuat data yang diperlukan tiket, tanpa email, telepon, meeting URL atau passcode. Ada batas permintaan per akun. Role admin tidak melewati pemeriksaan pemilik unduhan ini.
- Tombol Unduh tiket meminta data terbaru dari server lalu membuat PNG melalui Canvas dan QRCode existing. Refund di server setelah halaman terbuka tetap menolak unduhan. File bernama tiket-<kode>.png berukuran lebar1200px dengan tinggi mengikuti isi. Nama/judul panjang dibungkus utuh; QR480px dengan margin putih, koreksi M dan warna ungu gelap/putih. Referensinya sama dengan yang dibaca check-in, tanpa tautan pertemuan atau kredensial.
- Tampilan memakai header ungu #5031ad, logo existing, garis awan buatan kode, bidang informasi putih, pemisah putus-putus dan bagian QR lavender. Ungu menunjukkan penerbit; bentuk awan merujuk nama Awan Event; pemisah membedakan detail dan area pemeriksaan. Tidak menambah foto, gradient atau glow.
- Nama peserta/nama tiket mengikuti casing tersimpan. Inter, heading22px, nama19px dan detail14px menjaga hierarki. Monospace hanya untuk kode yang perlu dicocokkan petugas. Dua kolom kartu setara pada desktop1200+, satu kolom di layar lebih kecil, QR bertumpuk pada ponsel sempit. Tombol unduh penuh di bawah, tanpa tombol Buka/Lihat event.
- Status berasal dari kehadiran/lifecycle: Siap digunakan, Kehadiran tercatat atau Event selesai. Tersedia keadaan memuat, kosong, gagal muat dan muat ulang; unduhan memiliki pending/disabled, error dan retry. Koneksi terputus, timeout dan respons bukan JSON menampilkan pesan Indonesia yang dapat ditindaklanjuti. QR component mereset gambar/error ketika referensi berubah.

Tidak menambah dependensi atau migrasi. Tidak mengubah SMTP, domain atau akun produksi.

## Verifikasi

Build source final lulus kompilasi, lint, tipe dan prerender, termasuk endpoint tiket dinamis. Seluruh100 tes lulus, termasuk9 tes baru: matriks eligibility/status/hybrid/deleted, harga historis dan grup, data minimal/jadwal WIB lintas tanggal, pemilik/role/anonim/format/rate limit/record hilang, order induk grup, harga tersimpan pada pembeli dan anggota, check-in admin serta akses online gratis, SSR tiket/keadaan, dan snapshot grup lama tanpa bocor identitas pemesan atau menulis data.

Edge headless memakai Tickets, TicketCode, renderer Canvas dan shell/sidebar asli dengan CSS build. Auth dan penyimpanan diganti fixture lokal berlabel; permintaan unduh menjalankan handler GET asli melalui transport uji, termasuk guard kepemilikan/eligibility. Tidak menguji dengan transaksi atau akun produksi.

Enam lebar360/390/768/1024/1200/1440 lulus tanpa overflow, kartu setara dan tepat empat tiket eligible dari campuran sembilan pendaftaran. Tidak ada permintaan unduh sebelum klik. Empat PNG nyata (berbayar online, gratis offline, hybrid offline, anggota grup berbayar) diunduh dan QR-nya didekode jsQR ke referensi asli. Contoh standar1200x1678. Referensi yang didekode dari PNG gratis offline berhasil melewati runAction check-in asli dengan admin operasional/event ongoing/storage lokal, lalu perubahan attendance tercatat pada commit uji.

Stale UI sesudah refund ditolak server; HTTP503, koneksi terputus dan respons bukan JSON memberi error jelas; retry menghasilkan unduhan. Respons404/503 dan kegagalan jaringan yang sengaja dipicu dicatat terpisah sebagai expectedHttpErrors, bukan ditutupi. Console/page errors tak terduga kosong.

Detail langsung untuk gratis online menampilkan keterangan tanpa QR/tombol event. Detail eligible, sidebar kecil, nama/judul panjang pada360px dan PNG tinggi dinamis lulus, QR panjang tetap terbaca. Tombol ponsel sentuh memulai unduhan PNG. Reflow720, fokus keyboard2px, reduced-motion dan forced-colors lulus; warna asli QR dipertahankan pada high contrast.

Kontras computed styles: judul putih di ungu8,81:1, kicker6,93:1, label peserta5,91:1, status7,92:1 dan keterangan QR5,31:1. Screenshot desktop/ponsel dan PNG unduhan diperiksa visual. Bukti lokal: tmp/admission-all-tests.log, tmp/admission-build.log, tmp/admission-tickets-qa.json, tmp/admission-tickets-browser.log, tmp/admission-tickets-1440.png, tmp/admission-tickets-390.png, tmp/admission-ticket-detail-1440.png, tmp/admission-ticket-export-0.png..3.png dan tmp/admission-ticket-long-export.png. Semua berisi data uji lokal.

## Delivery Gate

- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS: enam lebar, judul/nama panjang, reflow720 dan popup browser unduhan tidak menyebabkan overflow.
- R-17 PASS: tidak menambah statistik atau tren produk.
- R-18 PASS: tidak menambah testimonial atau identitas rekaan di produk.
- R-23 PASS: memakai logo existing dan aksen awan yang diminta; data uji hanya fixture berlabel.
- R-24 PASS: tidak menambah navigasi palsu, endpoint tersedia dan route detail diuji.
- R-25 PASS: seluruh pasangan teks baru yang diukur minimal5,31:1; QR asli dipertahankan pada forced-colors.
- R-26 PASS: unduh PNG nyata, retry, QR decode dan check-in handler asli diuji.
- R-27 PASS: memuat/kosong/error/disabled/pending/retry tersedia dan diuji.
- R-28 PASS: tidak mengubah FAQ.
- R-32 PASS: tombol berlabel, role status/alert, fokus2px, keyboard dan sentuhan diperiksa.
- R-33 PASS: fitur ditulis pada source melalui apply_patch; skrip terpisah hanya untuk fixture/QA.
- R-34 PASS: tema terang, reduced-motion dan forced-colors dipertahankan.
- R-35 PASS: build final,100 tes dan browser/PNG/check-in uji lulus, hasil visual diperiksa.
- R-36 PASS: hasil lokal dibedakan dari produksi; tidak mengklaim transaksi atau keamanan di luar guard yang diuji.
- R-37 PASS: arah pengguna eksplisit dan dials1/1/1 dicatat.
- R-38 PASS: tiket produk mengambil pendaftaran/event asli, tidak memasukkan konten fixture ke produk.
- R-01 PASS: header solid, tanpa gradient/glow baru.
- R-04 PASS: ikon Ticket/Download menandai jenis dokumen dan tindakan sebenarnya.
- R-06 PASS: Inter mengikuti dashboard, monospace hanya untuk kode pemeriksaan.
- R-07 PASS: tidak menambah grid/dot/blueprint dekoratif.
- R-08 PASS: ikon unduh fungsional, tanpa panah CTA dekoratif.
- R-09 PASS: label Online/Tatap muka dan status mencerminkan data sebenarnya.
- R-10 PASS: tidak ada glass/blur baru.
- R-12 PASS: bayangan pendek menandai kartu sebagai dokumen, tanpa elevasi berlebihan.
- R-13 PASS: tidak ada glow.
- R-14 PASS: kartu setara mengikuti format tiket dan permintaan simetri pengguna sebelumnya.
- R-19 PASS: tidak menambah animasi berulang, hanya keadaan kontrol existing.
- R-22 PASS: motif awan buatan kode terkait merek, tanpa ilustrasi stok.
- Liveliness dials PASS: ENERGY/RHYTHM/MOTION1/1/1 menjaga tugas simpan/periksa tetap jelas.
- Liveliness focus PASS: judul, nama peserta dan QR menjadi hirarki utama.
- Liveliness spacing PASS: header, data dan stub QR dipisahkan menurut fungsi.
- Liveliness accent PASS: ungu penerbit dan tombol unduh, bagian informasi tetap terang.
- Liveliness identity PASS: logo, nama dan motif awan Awan Event hadir pada kartu/PNG.
- Liveliness Design Read PASS: aturan tiket, format unduhan dan arah visual disampaikan sebelum implementasi.
- C-1 PASS: alasan warna, motif, ukuran QR, layout, font dan format file dicatat.
- C-2 PASS: tombol menghasilkan file yang dapat dipindai, failure/retry tetap berfungsi.
- C-3 PASS: seluruh kelompok berisi identitas, waktu/lokasi atau informasi pemeriksaan tiket.
- C-4 PASS: status transaksi, grup lama/baru, role, viewport, jaringan dan input panjang diperiksa.
- C-5 PASS: tidak menambah data, klaim atau statistik rekaan dalam produk.
- R-05 PASS: komposisi mengikuti dokumen tiket, tanpa bagian marketing tambahan.
- R-11 PASS: radius kartu24px, label8px dan tombol existing berbeda fungsi.
- R-15 PASS: Unduh tiket dan Muat ulang tiket menyebut tindakan jelas.
- R-16 PASS: copy tanpa buzzword.
- R-20 PASS: identitas penerbit dan kebutuhan check-in Awan Event menjadi dasar desain.
- R-21 PASS: header ungu adalah aksen dokumen yang diminta, ruang kerja tetap terang.
- R-29 PASS: putih/netral/lavender dengan ungu sebagai aksen, error memakai token existing.
- R-30 PASS: desain tiket memakai aset/palet aplikasi sendiri.
- R-31 PASS: keputusan dan bukti perubahan dicatat bersama batas pengujiannya.

# Pola interaksi bersama Awan Event, 17 Oktober 2026

Pengguna memilih sidebar sebagai acuan klik dan hover untuk aplikasi. Lingkup implementasi: komponen bersama untuk halaman publik, dashboard peserta dan admin. Arah tetap terang, ungu/lavender Awan Event, ENERGY 1 / RHYTHM 1 / MOTION 1. Susunan konten, hak akses dan data aplikasi mengikuti fitur yang ada.

## Keputusan dan implementasi

- Palet: token --ux di app/interactions.css menyamakan hover lavender #ece7f6, pressed #e3dbee dan teks aktif #5031ad dengan sidebar.
- Hirarki: tombol utama tetap ungu, aksi sekunder putih, pilihan aktif putih dengan teks lebih tebal, aksi destruktif merah dan kontrol nonaktif abu dengan teks terbaca.
- Gerak: transisi warna/border 140ms memberi feedback tanpa mengangkat tombol atau memperbesar gambar. Hover perangkat berpointer halus dan pressed pada sentuhan ditangani terpisah.
- Ukuran: target kontrol minimal 44px, field 48px/font 16px; radius 12px meneruskan sidebar tanpa mengubah semua permukaan menjadi pill.
- Fokus: outline ungu 2px dengan lapisan putih membantu identifikasi di berbagai surface; menu item, summary, field dan tautan menerima indikator.
- Form: Field menghubungkan label ke input native maupun Input bersama, mempertahankan id/nama aksesibel eksplisit dan hint. Label tunggal dapat diklik untuk fokus.
- Proses: Button menyediakan loading/loadingLabel, disabled dan aria-busy; dua label menempati grid yang sama sehingga lebar tidak berubah saat memproses. Link asChild yang nonaktif tetap memiliki tujuan tetapi aksinya diblokir dan dilewati Tab.
- Kartu: judul katalog event memiliki tautan nyata; hover hanya menandai hubungan dengan aksi. Kartu beranda dan foto tidak bergerak/zoom saat hover.
- Navigasi: menu publik, pilihan status/filter, CMS, pilihan kehadiran, dropdown dan delapan langkah editor memakai state serupa. Tombol tutup panel 44px berlabel Tutup panel.

Tidak menambah aset, dependensi, migrasi atau perubahan API. Tidak mengubah konfigurasi SMTP atau memutasi akun/event produksi. Sidebar mengambil token yang sama tanpa mengganti struktur maupun filter peran.

## Verifikasi dan batasnya

Build produksi akhir lulus kompilasi, lint, TypeScript dan prerender. Suite 83/83 tes lulus, termasuk tiga tes baru untuk loading, link nonaktif, serta asosiasi label/hint/id. Harness tes kini menyelesaikan import TS dan TSX; kegagalan awal karena harness hanya menambahkan .ts diperbaiki tanpa mengurangi assertion bisnis sebelumnya.

Browser headless menjalankan komponen asli Navbar7, EventsBrowser, FeaturedPrograms, AuthForm, ProfileEditor, halaman Event admin, EventWizard, Button/Input, dropdown/tooltip/panel Radix dan shell admin/peserta. Sesi, transport Auth/API dan isi akun memakai fixture lokal berlabel. CSS berasal dari build dengan urutan stylesheet HTML hasil prerender; pemeriksaan akhir tidak menambahkan stylesheet pengganti.

Matriks 30 pemeriksaan: enam tampilan pada 360, 390, 768, 1024 dan 1440px. Tidak ada overflow horizontal; field terukur font minimal 16px/tinggi 44px, tombol yang diperiksa minimal 44px. Pemeriksaan sidebar tambahan mempertahankan tiga peran pada lima viewport, 66 klik tujuan, fokus, drawer ponsel, pencarian, perkecil/perbesar dan logout fixture.

Catatan klik/interaksi yang diperiksa:

1. Tombol simpan: normal ungu, hover lebih gelap, pressed lebih gelap lagi; transform tetap none dan lebar tetap 132,375px pada label proses. Klik ulang saat memproses tidak menambah aksi, selesai mengembalikan label.
2. Tombol sekunder: hover lavender, ukuran tetap. Tombol dan tautan nonaktif berwarna abu dengan opacity 1; pointer pada tautan tidak memanggil handler atau navigasi.
3. Pilihan filter: klik Selesai mengubah aria-pressed dan permukaan putih/ungu setelah transisi.
4. Field: klik label Input bersama memfokuskan kontrol; Tab/Shift+Tab, mengetik dan submit native bekerja. Disabled email profil tetap nonaktif.
5. Summary: membuka informasi tambahan melalui elemen details asli.
6. Dropdown: buka, navigasi keyboard, fokus item, Enter memilih Pengaturan; item nonaktif dilewati.
7. Panel: buka, Tutup panel dan Escape menutup serta mengembalikan fokus; tombol tutup terukur 44px.
8. Tooltip: muncul melalui fokus keyboard.
9. Katalog asli: pencarian kosong, reset, filter lifecycle, filter tambahan dan tautan judul menuju route event bekerja.
10. Kartu program: hover tidak mengubah transform, ukuran atau skala foto.
11. Login asli: tampil/sembunyi password, pending dan kegagalan provider bekerja; password/draft tetap tersedia untuk retry. Tidak mengirim email.
12. Event admin asli: pencarian kosong/reset, Sampah kosong, toggle publikasi dengan pending dan batal modal hapus bekerja pada fixture.
13. Editor asli: seluruh delapan langkah membuka bagian dan menandai current step putih/ungu.
14. Profil asli: nama dan WhatsApp tetap dapat diisi, email akun tetap disabled.
15. Menu publik ponsel: memilih Tentang kami memperbarui tujuan dan menutup menu; Escape mengembalikan fokus.
16. Reduced-motion meniadakan transisi bersama; forced-colors mempertahankan penanda pilihan.

Pemeriksaan tambahan: submit form kosong diblokir validasi required native, item dropdown nonaktif terukur opacity 1/teks #5d566e dengan aria-disabled true, dan tap pada konteks ponsel 390x844 memicu state pending. Matriks final dan tindakan diulang secara terpisah pada build yang sama setelah waktu ukur transisi disesuaikan.

Kontras WCAG dihitung: putih pada primary 7,27:1, hover 10,41:1, pressed 14,20:1; sekunder 8,81:1; teks muted pada lavender 6,32:1; teks disabled 5,90:1; destruktif 6,57:1; batas field 3,30:1. Sidebar tetap minimal teks 6,32:1. Kontrol nonaktif tidak diturunkan opacity teksnya.

Bukti lokal: tmp/ux-qa.json, tmp/sidebar-qa.json, tmp/ux-controls-1440.png, tmp/ux-controls-390.png, tmp/ux-events-1440.png, tmp/ux-events-390.png, tmp/ux-admin-1440.png, tmp/ux-wizard-1440.png dan tmp/ux-login-390.png. Console/page errors akhir kosong. Percobaan QA awal memilih tombol navbar desktop yang tersembunyi, mengukur transisi sebelum selesai dan menemukan label Input yang belum terhubung; selector/waktu ukur diperbaiki dan asosiasi label diperbaiki di source lalu diuji ulang. Pemeriksaan lokal tidak mengklaim seluruh transaksi backend atau akun produksi diuji secara manual.

## Delivery Gate

- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS: 30 kombinasi tampilan/lebar dan regresi sidebar 15 kombinasi tanpa overflow, target kontrol minimal 44px.
- R-17 PASS: tidak menambah jumlah atau statistik produk; angka laporan dari tes dan pengukuran lokal.
- R-18 PASS: tidak membuat testimonial atau identitas orang di produk.
- R-23 PASS: arah interaksi berasal dari pilihan pengguna; logo/aset yang ada dipertahankan.
- R-24 PASS: judul event memakai eventPublicPath yang sama dengan tombol Detail, tujuan sidebar diperiksa sebelumnya dan diuji ulang.
- R-25 PASS: warna teks baru terendah 5,90:1 dan batas field 3,30:1; focus ungu terukur 2px.
- R-26 PASS: daftar 16 interaksi di atas dijalankan; pending dan disabled benar-benar memblokir aksi.
- R-27 PASS: pending, disabled, invalid native, error Auth, katalog kosong, Sampah kosong dan retry tetap tersedia.
- R-28 PASS: FAQ tidak ditambah; details tetap disclosure native.
- R-32 PASS: label dapat diklik, keyboard, tooltip, dropdown, Escape dan pengembalian fokus diperiksa.
- R-33 PASS: source ditulis melalui apply_patch, skrip hanya membundel fixture dan melakukan QA.
- R-34 PASS: tema terang mengikuti brand; forced-colors diuji dan tidak menambah toggle tema.
- R-35 PASS: build akhir, 83 tes, matriks dan klik komponen asli dengan transport fixture dijalankan.
- R-36 PASS: hasil lokal dibedakan dari deployment dan akun produksi.
- R-37 PASS: sidebar yang disetujui menjadi arah eksplisit; dials 1/1/1 dipertahankan.
- R-38 PASS: data contoh hanya di fixture berlabel, tidak ditulis ke aplikasi produksi.
- R-01 PASS: ungu/lavender berasal dari identitas Awan Event; kontrol tidak memakai gradient/glow baru.
- R-04 PASS: tidak menambahkan ikon dekoratif; ikon fungsi yang ada dipertahankan.
- R-06 PASS: font aplikasi tetap; field 16px meningkatkan keterbacaan dan perilaku ponsel.
- R-07 PASS: tanpa pola latar dekoratif baru.
- R-08 PASS: tanpa panah CTA baru, pergeseran ikon tautan saat hover dihilangkan.
- R-09 PASS: tanpa badge pemasaran; aria-current/pressed menyatakan pilihan nyata.
- R-10 PASS: tidak menambah blur/glass pada kontrol.
- R-12 PASS: bayangan ringan untuk pilihan/popover, tombol normal tetap datar.
- R-13 PASS: tidak menambahkan glow.
- R-14 PASS: tidak menambahkan kartu konten; komponen mengikuti fungsi yang ada.
- R-19 PASS: transisi dipicu interaksi, tanpa loop baru dan patuh reduced-motion.
- R-22 PASS: tanpa ilustrasi baru.
- Liveliness dials PASS: ENERGY/RHYTHM/MOTION 1/1/1 sesuai antarmuka operasional.
- Liveliness focus PASS: aksi utama dan pilihan aktif terbaca melalui hirarki dan bobot.
- Liveliness spacing PASS: susunan halaman dipertahankan; target 44px dan field 48px membuat interaksi nyaman.
- Liveliness accent PASS: ungu untuk aksi/pilihan, merah tetap mempunyai arti destruktif.
- Liveliness identity PASS: token sidebar menjadi acuan komponen publik dan workspace.
- Liveliness Design Read PASS: arah interaksi bersama dinyatakan sebelum implementasi.
- C-1 PASS: alasan palet, hirarki, motion, ukuran, fokus, proses dan kartu dicatat.
- C-2 PASS: state sibuk/nonaktif bukan sekadar tampilan; handler/navigasi diuji.
- C-3 PASS: memakai komponen fitur yang tersedia tanpa bagian tambahan untuk dekorasi.
- C-4 PASS: enam tampilan, lima viewport, tiga peran sidebar, keyboard, motion dan error diperiksa.
- C-5 PASS: tidak menambah klaim produk atau data rekaan produksi.
- R-05 PASS: struktur halaman tetap mengikuti fitur; perubahan pada interaksi komponen bersama.
- R-11 PASS: radius 12px meneruskan sidebar, panel dan thumbnail tetap mempunyai skala masing-masing.
- R-15 PASS: label aksi tetap spesifik, status Memproses menjelaskan keadaan nyata.
- R-16 PASS: tanpa buzzword pemasaran.
- R-20 PASS: pola sidebar dan warna brand mengikat pengalaman publik, peserta dan admin.
- R-21 PASS: tema terang yang disetujui dipertahankan.
- R-29 PASS: ungu/lavender, netral dan merah semantik untuk aksi berbahaya.
- R-30 PASS: menggunakan sidebar aplikasi yang dipilih pengguna sebagai acuan.
- R-31 PASS: alasan keputusan utama tercantum pada bagian implementasi.
- UI checklist PASS: palette, state, hirarki, motion dan perilaku kontrol diperiksa sesuai lingkup.
- Human checklist PASS: kontras, asosiasi label, fokus, keyboard, disabled/pending dan error diverifikasi.
- Layoutmobile checklist PASS: tidak ada overflow, font field 16px, menu ponsel dan ukuran kontrol diperiksa.

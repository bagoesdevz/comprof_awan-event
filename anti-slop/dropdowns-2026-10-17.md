# Dropdown Awan Event, 17 Oktober 2026

Pengguna meminta tombol dropdown mengikuti komponen shadcn/ui. Arah tetap mengacu pada sidebar yang sudah disetujui: permukaan terang, ungu/lavender, ENERGY 1 / RHYTHM 1 / MOTION 1. Dropdown menampilkan pilihan dengan hirarki yang jelas tanpa mengubah susunan halaman atau tujuan navigasi.

## Implementasi dan alasan

- Komponen Select, SelectTrigger, SelectContent, SelectItem dan SelectInput memakai Radix Select 2.4.1, mengikuti komposisi [shadcn/ui Radix Select](https://ui.shadcn.com/docs/components/radix/select) dan [API Radix](https://www.radix-ui.com/primitives/docs/components/select).
- Field merender select native yang sudah dipakai aplikasi melalui SelectInput bersama. Nama field, callback onChange, nilai kosong, angka, required, disabled, label dan hint tetap terhubung. Pemilihan Radix mengirim event change pada select native pendamping, sehingga handler lama menerima event DOM dari elemen sebenarnya.
- SelectInput mempertahankan kontrol native tersembunyi untuk FormData, validasi required dan reset formulir. Nilai kosong memakai key terpisah di Radix agar pilihan Semua dapat dipilih kembali; payload formulir tetap string kosong. Validasi menampilkan pesan terhubung dan memfokuskan trigger bila select merupakan field invalid pertama.
- Dropdown peran di tabel akun memakai SelectInput langsung karena berada di luar Field. Kontrak PATCH dan perlindungan perubahan peran tetap ada.
- Tombol pemicu 48px/font 16px, item pilihan minimal 44px. Centang menunjukkan nilai yang dipilih, chevron menunjukkan keadaan terbuka. Ikon mempunyai fungsi kontrol, bukan dekorasi CTA.
- Popup memakai portal agar tidak terpotong panel/tabel. Lebar mengikuti trigger, tinggi mengikuti ruang viewport dengan batas 360px, judul panjang membungkus dalam daftar dan terpotong rapi pada trigger. Bayangan ringan menunjukkan lapisan popup.
- Transisi 140ms dan animasi masuk 3px hanya saat interaksi; reduced-motion meniadakannya. Warna berasal dari token sidebar. Pilihan aktif dan hover memakai lavender, teks ungu, dengan indikator fokus serta forced-colors.
- DropdownMenu yang sudah ada juga dibatasi lebar/tingginya mengikuti viewport dan dapat digulir.

## Verifikasi

Build produksi final lulus kompilasi, lint, tipe dan prerender tanpa peringatan. Lint terpisah lulus. Seluruh 85 tes lulus, termasuk dua tes baru untuk asosiasi Field/combobox, required/nama formulir, nilai kosong, disabled dan nilai numerik nol. Audit npm untuk dependensi produksi melaporkan nol kerentanan; audit penuh npm saat instalasi masih melaporkan tujuh masalah pada dependensi pengembangan yang tidak diubah dalam pekerjaan ini.

Browser headless Edge memakai komponen aplikasi asli dengan akun/transport fixture lokal berlabel dan CSS build produksi. Tidak mengirim email atau mengubah data produksi. Matriks lima tampilan (kontrol, katalog event, admin event, profil dan editor) pada 360/390/768/1024/1440 menghasilkan 25 pemeriksaan, 55 kontrol terukur termasuk lima nonaktif, dan 50 buka/tutup popup dengan Escape/fokus kembali. Tidak ada overflow; trigger 48px/font 16px dan popup tetap dalam viewport.

Catatan tindakan:

1. Required kosong memblokir submit, menampilkan pesan dan memfokuskan trigger. Home/ArrowDown/Enter memilih opsi, melewati item nonaktif dan membersihkan error.
2. FormData berisi pilihan tepat satu kali, mempertahankan nol dan mengecualikan kontrol disabled. Reset mengembalikan placeholder dan validasi.
3. Filter terkontrol memilih kategori lalu kembali ke Semua dengan nilai kosong; disabled tidak dapat membuka dan bisa diaktifkan kembali.
4. Daftar 50 pilihan mendukung gulir, End dan pencarian lewat ketikan. Klik luar menutup tanpa mengubah pilihan.
5. Filter katalog asli mengubah hasil, menampilkan kosong, dapat dikembalikan ke Semua; seluruh filter tambahan dan Reset diuji.
6. Label profil membuka daftar; pilihan tetap ada setelah field lain diedit. Simpan profil menyimpan gender/source yang dipilih; fieldset menonaktifkan trigger selama proses lalu mengaktifkannya kembali.
7. Seluruh delapan langkah editor dibuka; lima dropdown yang tersedia pada data fixture dipilih, termasuk format, waitlist, platform, harga dan kehadiran.
8. UsersAdmin asli memilih peran dan mengirim payload PATCH yang sama ke stub lokal; tombol Simpan kembali disabled sesudah sukses. Peran default undangan dan nama field role diperiksa tanpa mengirim undangan.
9. Viewport pendek 390x568 membungkus judul panjang dalam popup yang bisa digulir, sementara trigger memakai ellipsis. Escape mengembalikan fokus lalu Tab berpindah ke kontrol berikutnya. Saat terbuka, navigasi mengikuti perilaku Radix: tombol panah/Enter dan Escape.
10. Reduced-motion, forced-colors serta tap buka/pilih/kirim pada ponsel 390x844 lulus.
11. Regresi 16 alur UX sebelumnya diulang, termasuk tombol pending, tautan disabled, menu keyboard, panel/Escape, tooltip, katalog, login gagal, admin, editor, profil dan navigasi ponsel. Matriks 30 tampilan lama yang disertakan skrip regresi tidak dihitung sebagai pengukuran baru.

14 alur utama, empat alur tambahan dan 16 alur regresi lulus; console/page errors akhir kosong. Pengujian awal memperbaiki selector QA yang mencakup datalist/filter tersembunyi, jeda fokus Radix, label yang memang membuka daftar, dan asumsi Tab menutup popup. Fixture sempat dihentikan oleh pergantian file CSS selama build, kemudian dimulai ulang dengan build final. Pemeriksaan yang dilaporkan memakai build final; screenshot popup diambil per viewport agar capture full-page tidak mengubah posisi overlay.

Bukti lokal: tmp/dropdown-qa.json, tmp/dropdown-extra-qa.json, tmp/ux-qa.json (bagian actions), tmp/dropdown-events-1440.png, tmp/dropdown-events-390.png, tmp/dropdown-admin-1440.png, tmp/dropdown-profile-390.png, tmp/dropdown-wizard-1440.png dan tmp/dropdown-long-390.png. Foto/logo di fixture adalah aset proyek yang ada; judul dan akun diberi label uji. Tampilan produksi dengan akun nyata belum diuji.

## Delivery Gate

- R-02 PASS: teks baru tanpa em dash.
- R-03 PASS: 25 kombinasi viewport dan layar pendek tanpa overflow popup/trigger.
- R-17 PASS: tidak menambah statistik produk; angka laporan berasal dari QA.
- R-18 PASS: tidak menambah testimonial atau identitas fiktif di produk.
- R-23 PASS: arah dari referensi dan sidebar yang disetujui; tanpa aset baru.
- R-24 PASS: tidak menambah atau mengganti tujuan navigasi.
- R-25 PASS: token teks/fokus meneruskan palet terukur sebelumnya, teks disabled 5,90:1 dan batas field 3,30:1; opsi normal gelap pada putih, error merah yang sama.
- R-26 PASS: pilihan, filter, reset dan submit diuji; menu berfungsi dan disabled diblokir.
- R-27 PASS: required, error, disabled, proses simpan, hasil kosong dan reset diperiksa.
- R-28 PASS: tidak menambah FAQ.
- R-32 PASS: label, nama aksesibel, keyboard, Escape/fokus kembali dan forced-colors diperiksa.
- R-33 PASS: fitur ditulis di source melalui apply_patch; skrip digunakan untuk fixture/QA.
- R-34 PASS: tema terang brand dipertahankan, forced-colors diuji.
- R-35 PASS: build final, 85 tes dan interaksi komponen asli dijalankan.
- R-36 PASS: hasil lokal dibedakan dari deployment dan data produksi.
- R-37 PASS: dials 1/1/1 meneruskan arah sidebar pilihan pengguna.
- R-38 PASS: contoh hanya dalam fixture berlabel, tidak menjadi data produksi.
- R-01 PASS: tanpa gradient/glow baru; ungu/lavender mengikuti brand.
- R-04 PASS: centang/chevron menandai pilihan, buka/tutup dan gulir.
- R-06 PASS: font aplikasi dipertahankan, trigger 16px untuk keterbacaan ponsel.
- R-07 PASS: tanpa pola latar baru.
- R-08 PASS: chevron mempunyai fungsi dropdown; tanpa panah CTA baru.
- R-09 PASS: tanpa badge pemasaran baru.
- R-10 PASS: tanpa glass/blur baru.
- R-12 PASS: bayangan ringan hanya untuk lapisan popup.
- R-13 PASS: tanpa glow baru.
- R-14 PASS: tidak menambah kartu atau mengubah hirarki konten halaman.
- R-19 PASS: gerak hanya saat interaksi, 140ms, tanpa loop dan patuh reduced-motion.
- R-22 PASS: tanpa ilustrasi baru.
- Liveliness dials PASS: ENERGY/RHYTHM/MOTION tetap 1/1/1.
- Liveliness focus PASS: nilai aktif memakai centang, bobot dan warna.
- Liveliness spacing PASS: padding dan target sentuh memisahkan pilihan.
- Liveliness accent PASS: aksen ungu konsisten dengan sidebar.
- Liveliness identity PASS: lavender, radius dan tipografi meneruskan Awan Event.
- Liveliness Design Read PASS: pola dropdown, brand dan perilaku dinyatakan sebelum implementasi.
- C-1 PASS: alasan palet, ukuran, overlay, motion dan ikon dicatat.
- C-2 PASS: callback, validasi, filter dan formulir mempunyai perilaku nyata.
- C-3 PASS: memperbaiki kontrol yang ada tanpa bagian dekoratif tambahan.
- C-4 PASS: desktop/ponsel, keyboard, nilai kosong/nol, disabled, proses dan reset diperiksa.
- C-5 PASS: tidak membuat klaim atau data pelanggan baru.
- R-05 PASS: struktur halaman mengikuti kebutuhan fitur yang sudah ada.
- R-11 PASS: trigger 12px, popup 14px dan item 9px sesuai hirarki komponen.
- R-15 PASS: memakai label aksi aplikasi yang ada, error memberi instruksi memilih.
- R-16 PASS: tanpa buzzword pemasaran baru.
- R-20 PASS: mempertahankan palet dan karakter sidebar Awan Event.
- R-21 PASS: tidak memaksakan tema gelap.
- R-29 PASS: palet brand dengan merah khusus error; tidak menambah aksen lain.
- R-30 PASS: pola perilaku shadcn sesuai permintaan, identitas tetap Awan Event.
- R-31 PASS: alasan keputusan visual ditulis di atas.

# Audit tombol duplikat, 17 Oktober 2026

Pengguna meminta audit tombol berulang dalam satu halaman, misalnya Lihat website. Pemeriksaan source mencakup 46 route halaman dan inventaris 59 file TSX yang memuat kontrol. Duplikasi diputuskan berdasarkan tujuan dan keadaan tampilan, bukan hanya kesamaan label. Arah tetap mengikuti sidebar yang disetujui: terang, ungu/lavender Awan Event, ENERGY 1 / RHYTHM 1 / MOTION 1. Perubahan mengurangi gangguan visual tanpa menambah komponen atau gaya baru.

## Temuan dan perbaikan

| Lokasi/keadaan | Sebelum | Sesudah |
| --- | --- | --- |
| CMS admin desktop | Lihat website di sidebar dan header, Buka website di heading CMS | Satu akses eksplisit di sidebar; Pratinjau draft CMS tetap ada |
| Halaman admin lain | Lihat website di sidebar dan header desktop | Satu akses di sidebar, tersedia melalui Menu pada ponsel |
| Event admin kosong | Buat event di header dan empty state | Satu Buat event di header |
| Ringkasan admin tanpa agenda | Buat event di header dan panel agenda kosong | Satu Buat event di header; halaman Laporan tetap memiliki satu aksi buat karena header-nya Ekspor CSV |
| Event/Transaksi dengan filter tanpa hasil | Dua Hapus filter menjalankan reset yang sama | Satu Hapus filter di ringkasan filter, tetap tampil saat hasil kosong |
| Dashboard peserta baru tanpa event | Empat tautan katalog pada header, hero dan dua empty state | Satu CTA katalog di hero; peserta terdaftar memakai satu Jelajahi event di header |
| Event mendatang beranda kosong | Lihat semua event dan Buka katalog event pada bagian sama | Satu Lihat semua event pada heading bagian |
| Footer publik | FAQ dan Kontak di kolom Dukungan serta baris bawah | Masing-masing satu; tautan bawah dengan tujuan berbeda tetap dapat ditampilkan |
| Editor artikel tersimpan | Kembali dan Batal memanggil callback keluar yang sama | Satu Kembali, tombol Simpan artikel tetap ada; artikel baru tetap dapat ditutup |
| Editor pembuka event | Semua bagian dan Ubah cover kartu event mengembalikan ke daftar yang sama | Satu Semua bagian, petunjuk cover diperjelas dan input cover tetap dapat dicapai |

Label aksesibel Lihat semua untuk Event saya dan Rekomendasi diberi konteks tujuan. Tombol Edit/Lihat event, Daftar/Detail, PNG/SVG, simpan draf/publikasi, aksi tiap baris data, tahapan aktivitas dan tombol kembali dari modal tetap dipertahankan karena fungsi atau konteksnya berbeda. Logo, navigasi utama, sidebar dan footer tetap menyediakan navigasi pada lokasi masing-masing. CTA pendaftaran pada bagian harga dan akhir detail event tetap mendukung pilihan tiket serta pembaca halaman panjang. Kode EventLocation lama tidak diperlakukan sebagai tombol yang muncul bersamaan dengan EventAccessSection karena komponen tersebut tidak dirender oleh detail event saat ini.

## Verifikasi

Build produksi lulus kompilasi, lint, tipe dan prerender tanpa peringatan. Seluruh 85 tes yang ada lulus. Tidak menambah tes permanen untuk penghapusan kontrol ini; perilaku sisa diperiksa langsung di browser.

Browser Edge headless memakai komponen asli dengan data/transport fixture lokal berlabel serta CSS build produksi. Dua belas kondisi tampilan (CMS, daftar event kosong/terisi, transaksi kosong/terisi, ringkasan kosong, laporan kosong, dashboard baru/terdaftar, beranda kosong, artikel dan editor event) pada lima lebar 360/390/768/1024/1440 menghasilkan 60 pemeriksaan tanpa overflow. Jumlah kontrol sisa diverifikasi di setiap kondisi: satu website, satu buat event, satu reset, satu CTA katalog peserta dan satu FAQ/Kontak per footer sesuai konteks.

Sembilan catatan aksi di tmp/action-audit-qa.json mencakup matriks tersebut dan pengujian klik: CMS Pratinjau/Edit mempertahankan draft, simpan CMS sukses pada transport lokal, simpan artikel lalu Kembali, keluar dari artikel baru, akses cover melalui Semua bagian, reset event via keyboard, reset transaksi mengembalikan baris/ekspor, akses website desktop/ponsel untuk super/operasional, serta katalog peserta baru/terdaftar. Semua lulus. Regresi sidebar juga lulus: 15 kombinasi tiga peran/lima ukuran, 66 klik tujuan, collapse/drawer, Escape/fokus kembali, pencarian, keluar fixture, keyboard dan forced-colors. Console/page errors kosong.

Bukti lokal: tmp/button-inventory.json (inventaris sebelum perubahan), tmp/action-audit-qa.json, tmp/sidebar-qa.json, tmp/actions-cms-1440.png, tmp/actions-cms-390.png, tmp/actions-dashboard-390.png, tmp/actions-dashboard-enrolled-1440.png dan tmp/actions-home-1440.png. Screenshot hanya menampilkan data fixture; akun dan data produksi tidak diubah. Pemeriksaan semua route dilakukan pada source; pengujian browser terfokus pada komponen dan keadaan yang berubah, bukan seluruh transaksi produksi.

## Delivery Gate

- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS: 60 kombinasi perubahan dan 15 regresi sidebar tanpa overflow.
- R-17 PASS: tidak menambah angka produk; angka laporan berasal dari inventaris/QA.
- R-18 PASS: tidak menambah testimonial atau orang fiktif di produk.
- R-23 PASS: memakai identitas/sidebar yang disetujui, tanpa aset atau navigasi baru.
- R-24 PASS: tujuan tersisa tetap ada dan navigasi sidebar diperiksa ulang.
- R-25 PASS: tidak mengubah warna/font; kontras sidebar diuji ulang, teks minimum 6,32:1, fokus 2px solid.
- R-26 PASS: kontrol sisa untuk setiap temuan diklik/diperiksa; fungsi tidak diwakili tombol kosong.
- R-27 PASS: keadaan kosong, filter tanpa hasil, pending/sukses simpan dan akses keluar tetap tersedia.
- R-28 PASS: konten FAQ tidak diubah; hanya tautan footer duplikat dibuang.
- R-32 PASS: reset via keyboard, label konteks, menu ponsel dan pengembalian fokus lulus.
- R-33 PASS: perubahan source melalui apply_patch; skrip hanya inventaris dan QA.
- R-34 PASS: tema terang yang ada dipertahankan; forced-colors sidebar lulus.
- R-35 PASS: build, 85 tes, matriks dan klik komponen asli lulus.
- R-36 PASS: bukti lokal dibedakan dari perilaku produksi/deployment.
- R-37 PASS: arah dan dials 1/1/1 meneruskan pilihan sidebar pengguna.
- R-38 PASS: data contoh hanya di fixture lokal berlabel.
- R-01 PASS: tidak menambah gradient/glow.
- R-04 PASS: tidak menambah ikon.
- R-06 PASS: tidak mengganti tipografi.
- R-07 PASS: tidak menambah latar dekoratif.
- R-08 PASS: tidak menambah panah CTA.
- R-09 PASS: tidak menambah badge pemasaran.
- R-10 PASS: tidak menambah blur/glass.
- R-12 PASS: tidak menambah bayangan.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: tidak menambah kartu atau memaksakan tata letak baru.
- R-19 PASS: tidak menambah animasi; reduced-motion sidebar tetap lulus.
- R-22 PASS: tidak menambah ilustrasi.
- Liveliness dials PASS: ENERGY/RHYTHM/MOTION tetap 1/1/1.
- Liveliness focus PASS: satu CTA utama katalog/buat dan aksi kontekstual lebih jelas.
- Liveliness spacing PASS: kontrol redundan dihapus dari kelompok yang sama.
- Liveliness accent PASS: aksen ungu tetap mengikuti brand.
- Liveliness identity PASS: pola sidebar dipertahankan.
- Liveliness Design Read PASS: penyatuan aksi dan pelestarian fungsi berbeda dinyatakan sebelum edit.
- C-1 PASS: alasan setiap penghapusan dicatat pada tabel.
- C-2 PASS: akses ke fungsi yang dipertahankan diverifikasi.
- C-3 PASS: mengurangi kontrol yang tidak menambah fungsi.
- C-4 PASS: keadaan kosong/terisi, filter, peran, desktop/ponsel dan keyboard diperiksa.
- C-5 PASS: tidak menambah klaim produk atau data pelanggan.
- R-05 PASS: susunan fitur yang ada dipertahankan.
- R-11 PASS: tidak mengubah radius komponen.
- R-15 PASS: copy kosong menunjuk aksi spesifik yang masih tersedia.
- R-16 PASS: tanpa buzzword baru.
- R-20 PASS: palet dan karakter Awan Event dipertahankan.
- R-21 PASS: tidak memaksakan tema gelap.
- R-29 PASS: tidak menambah warna.
- R-30 PASS: tidak menyalin tata letak produk lain.
- R-31 PASS: alasan perubahan dapat ditelusuri pada temuan dan bukti QA.

# Simetri kartu dan audit dropdown

Status: PASS. Design Read mengikuti screenshot pengguna: kartu yang setingkat dan berdampingan harus sama lebar/tinggi, tombol mengikuti dasar kartu, dropdown mengikuti komponen shadcn UI yang sudah tersedia. ENERGY 1 / RHYTHM 1 / MOTION 1. Tema putih/abu dan aksen ungu Awan Event dipertahankan.

## Perubahan

- Aktivitas utama peserta kini dua kolom 1fr/1fr pada desktop, dengan align-items:stretch. Langkah berikutnya dan Persyaratan sertifikat memiliki batas atas/bawah yang sejajar, termasuk saat salah satunya berisi lebih banyak informasi. Di ponsel/tablet keduanya bertumpuk.
- Riwayat peserta, kartu event, rekomendasi dan sertifikat memakai kelompok kartu yang meregang. Mulai 768px tinggi baris mengikuti kartu tertinggi dalam kelompok. Statistik dan daftar peserta juga memakai baris setara. Tinggi berasal dari isi, tanpa tinggi piksel tetap atau pemotongan judul untuk menyamakan ukuran.
- Footer aksi kartu event dan rekomendasi didorong ke bawah dengan flex layout. CTA Langkah berikutnya mengikuti dasar panel. Judul pendek dan panjang dapat tetap dibaca dengan posisi aksi sejajar.
- Kartu statistik admin, ringkasan peserta dan ringkasan sertifikat yang sudah memakai kolom setara diperiksa kembali. Panel formulir utama dengan sidebar alat tetap disusun menurut fungsinya; simetri diterapkan pada kelompok kartu setingkat.
- Audit AST menemukan 27 lokasi select: 26 di dalam Field, satu di adapter SelectInput. Sebelum perbaikan, dua select pada ParticipantsStudio berada di luar Field dan memakai tampilan native. Status pembayaran dan Event kini melalui Field/SelectInput berbasis Radix/shadcn, dengan label terhubung, opsi, nilai dan callback filter yang sama. Tidak tersisa select aplikasi di luar adapter/Field.
- Kolom filter peserta memakai minmax(0,...) agar kontrol dapat menyusut saat sidebar terbuka. Label dan trigger mengikuti komponen form bersama; target trigger 48px dan teks 16px.
- Komponen Disclosure baru memakai Collapsible/Trigger/Content Radix yang sudah tersedia dalam proyek. Data tambahan profil dan Filter lainnya di katalog memakai trigger, chevron, border, hover dan fokus yang sama dengan Select. Konten forceMount dan disembunyikan saat tertutup agar isian tetap terpasang. Trigger bertipe button sehingga tidak mengirim form. aria-expanded/controls diurus primitive.
- Menu notifikasi tetap memakai DropdownMenu dan grup sidebar memakai Collapsible existing. Tidak memasang dependensi, mengganti opsi, mengubah kontrak API, data, akses akun atau alur pendaftaran.

Keseragaman kartu adalah permintaan pengguna untuk membandingkan informasi setingkat. Radius panel, field dan tombol tetap berbeda menurut fungsi. Inter existing membantu konsistensi dengan dashboard; ungu tetap untuk aksi/fokus. Tidak menambah dekorasi atau animasi berulang.

## Verifikasi

Build source final lulus kompilasi, lint, tipe dan prerender49 halaman. Seluruh91 tes lulus. Tidak menambah tes permanen yang hanya menyalin CSS.

Edge headless memakai komponen aplikasi asli dan CSS build, dengan Auth/router/state dan transport akun lokal berlabel. Tidak mengubah akun produksi atau mengirim email. Matriks70 kombinasi14 halaman *5 lebar360/390/768/1024/1440 memeriksa dashboard, perjalanan event, sertifikat, ringkasan/laporan admin, peserta, pemantauan sertifikat, event admin, transaksi, CMS, artikel, wizard, akun dan profil. Kelompok kartu memiliki lebar/tinggi setara sesuai breakpoint, tidak ada overflow halaman atau select native terlihat. Data mencakup judul panjang, tiga pendaftaran dan dua rekomendasi dengan panjang teks berbeda. Sesudah penyetaraan baris daftar peserta, lima kombinasi halaman peserta pada source/CSS final diperiksa lagi, termasuk tinggi setiap baris daftar.

Regresi Select25 kombinasi memeriksa posisi popup, target48px/teks16px dan Escape/fokus kembali pada form contoh, katalog, event admin, profil dan wizard. Empat belas kelompok aksi lulus: required/invalid, navigasi Home/Arrow/Enter dan opsi disabled, FormData dengan nilai0, reset form, opsi Semua bernilai kosong, disabled toggle, daftar panjang/typeahead/scroll, klik luar, filter publik, filter tambahan, label profil, lima dropdown di delapan langkah editor, reduced-motion/forced-colors dan sentuhan ponsel.

Pengujian fitur memeriksa filter pembayaran/event secara gabungan, hasil kosong dan reset di390/1440; disclosure profil lewat Enter/Space, relasi aria-controls, draft institusi bertahan sesudah tutup/buka dan tidak submit; filter katalog bertahan saat ditutup serta dapat direset; sidebar kecil; reflow720; forced-colors/reduced-motion. Empat pengujian tambahan memastikan pilihan peran mengirim kontrak PATCH yang sama ke transport lokal, FormData undangan sesuai tanpa mengirim email, profil mempertahankan pilihan saat saving/fieldset disabled dan sesudah simpan, serta popup berlabel panjang muat di390x568 dengan Escape/fokus/Tab.

Console/page errors kosong pada seluruh rangkaian yang lulus. Kontras trigger disclosure15,14:1 dan Select16,17:1 pada katalog. Warna workspace tidak diubah. Screenshot dashboard/daftar peserta desktop dan ponsel serta sidebar kecil diperiksa visual; hanya berisi data uji lokal.

Bukti lokal: tmp/cards-dropdowns-source-audit.json, tmp/cards-dropdowns-build-final.log, tmp/cards-dropdowns-tests.log, tmp/cards-dropdowns-broad-qa.json, tmp/cards-dropdowns-qa.json, tmp/cards-dropdowns-select-regression.log, tmp/cards-dropdowns-select-extra.log, tmp/cards-dropdowns-dashboard-1440.png, tmp/cards-dropdowns-dashboard-390.png, tmp/cards-dropdowns-participants-1440.png dan tmp/cards-dropdowns-participants-390.png.

## Delivery Gate

- R-02 PASS: label yang dipakai kembali tidak menambah em dash.
- R-03 PASS:70 matriks umum,25 Select dan5 daftar peserta final tanpa overflow; popup ponsel pendek diuji.
- R-17 PASS: statistik tetap dihitung oleh model existing, tanpa angka tren baru.
- R-18 PASS: tidak menambah testimonial/identitas rekaan dalam produk.
- R-23 PASS: memakai aset dan data aplikasi; fixture QA ditandai lokal.
- R-24 PASS: tujuan aksi kartu tetap memakai route existing, tidak menambah tautan.
- R-25 PASS: trigger baru15,14:1 dan16,17:1; warna dashboard mengikuti audit sebelumnya.
- R-26 PASS: filter, disclosure, select form, role PATCH lokal dan pilihan wizard diuji.
- R-27 PASS: filter hasil kosong, keadaan baru, disabled dan pending simpan diperiksa; loading/error existing dipertahankan.
- R-28 PASS: tidak mengubah FAQ.
- R-32 PASS: Enter/Space, Home/Arrow/Enter, Escape/fokus kembali, Tab dan label terhubung diperiksa.
- R-33 PASS: fitur ditulis langsung melalui apply_patch; skrip terpisah hanya untuk audit/QA lokal.
- R-34 PASS: tema terang tetap; reduced-motion dan forced-colors lulus.
- R-35 PASS: build final,91 tes, matriks dan klik kontrol relevan lulus, screenshot diperiksa.
- R-36 PASS: hasil lokal tidak diklaim sebagai transaksi/pengubahan akun produksi.
- R-37 PASS: screenshot dan permintaan pengguna menjadi arah eksplisit; dials1/1/1 dicatat.
- R-38 PASS: tidak memasukkan konten/data fixture ke source aplikasi.
- R-01 PASS: tidak menambah gradient atau glow.
- R-04 PASS: chevron menandai keadaan buka/tutup, memakai ikon existing yang bermakna.
- R-06 PASS: Inter dashboard dan teks kontrol16px mengikuti identitas/keterbacaan existing.
- R-07 PASS: tidak menambah pola latar.
- R-08 PASS: chevron hanya pada kontrol yang membuka pilihan/panel, bukan panah CTA dekoratif.
- R-09 PASS: badge pembayaran/sertifikat existing tetap mewakili status sebenarnya.
- R-10 PASS: tidak menambah glass atau blur.
- R-12 PASS: bayangan existing dipertahankan, tidak menaikkan elevasi kartu.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: kartu setingkat disamakan atas permintaan pengguna, tanpa menyamakan semua jenis panel yang berlainan fungsi.
- R-19 PASS: transisi kontrol existing saja, tanpa animasi berulang; reduced-motion lulus.
- R-22 PASS: tidak menambah ilustrasi atau foto.
- Liveliness dials PASS: ENERGY/RHYTHM/MOTION1/1/1 cocok untuk tugas operasional.
- Liveliness focus PASS: aksi berikutnya dan persyaratan terlihat sebagai satu kelompok utama peserta.
- Liveliness spacing PASS: gap20px, dua kolom setara dan margin container existing mengatur kelompok informasi.
- Liveliness accent PASS: ungu tetap untuk aksi, fokus dan navigasi aktif.
- Liveliness identity PASS: palet, font, logo dan sidebar Awan Event tetap konsisten.
- Liveliness Design Read PASS: arah simetri dan dropdown disampaikan sebelum edit.
- C-1 PASS: alasan grid, tinggi otomatis, footer, adapter dan primitive dicatat.
- C-2 PASS: seluruh kontrol yang diubah memiliki perilaku nyata dan diuji.
- C-3 PASS: tidak menambah bagian untuk mengisi ruang, tinggi mengikuti isi terpanjang dalam kelompok.
- C-4 PASS: desktop/ponsel, teks panjang, empty, disabled, reset dan keyboard diuji.
- C-5 PASS: tidak membuat klaim atau data pengguna baru di produk.
- R-05 PASS: komposisi berdasarkan kelompok kartu yang ada dan screenshot pengguna, tanpa templat tambahan.
- R-11 PASS: radius panel, kontrol dan tombol tetap bervariasi sesuai peran.
- R-15 PASS: label Status pembayaran, Event, Data tambahan dan Filter lainnya menyebut fungsi nyata.
- R-16 PASS: tidak menambah buzzword.
- R-20 PASS: konteks event, persyaratan sertifikat dan warna Awan Event dipertahankan.
- R-21 PASS: tema terang sesuai arahan pengguna, tidak menambah tema gelap.
- R-29 PASS: netral dan ungu existing dipertahankan, tanpa warna baru.
- R-30 PASS: merapikan aplikasi sendiri dengan primitive existing, bukan menyalin produk lain.
- R-31 PASS: keputusan utama dan batas pengujian tercatat di atas.

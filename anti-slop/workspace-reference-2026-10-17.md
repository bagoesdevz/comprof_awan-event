# Dashboard mengikuti referensi, 17 Oktober 2026

Status: PASS untuk perubahan dashboard admin dan peserta yang disetujui pengguna. Arah: ruang kerja kegiatan dengan kartu putih, kanvas abu lembut, judul gelap dan aksen ungu Awan Event. ENERGY 1 / RHYTHM 1 / MOTION 1. Referensi pengguna menjadi dasar bentuk permukaan dan hierarki; isi tetap mengikuti kegiatan, transaksi dan perjalanan peserta aplikasi ini.

## Perubahan dan alasan

| Keputusan | Implementasi dan alasan |
| --- | --- |
| Palet | Kanvas #f3f3f4, teks #252429, teks pendukung #65636c; ungu tetap untuk aksi dan keadaan aktif agar identitas Awan Event terbaca pada tampilan netral. |
| Ringkasan admin | Angka operasional di kiri, agenda dengan cover event di kanan, transaksi di bawah ringkasan; membantu admin memeriksa antrean pembayaran dan kegiatan berikutnya. Laporan tetap lebar penuh. |
| Ringkasan peserta | Dua angka dari pendaftaran akun dan sertifikat berstatus valid. Kartu langkah berikutnya memakai permukaan putih dengan informasi event dan satu tombol tindakan. Riwayat dan rekomendasi tetap tersedia. |
| Data | Formula admin lama dipertahankan. Angka peserta berasal dari state akun; tidak menambah grafik, persentase tren, aktivitas, orang atau avatar fiktif untuk meniru gambar referensi. |
| Tipografi | Memakai Inter yang sudah terpasang untuk angka, judul dan kontrol ruang kerja; bentuk ringkasnya membantu pemindaian tabel dan label Indonesia serta menghindari pemuatan font tambahan. Angka memakai tabular-nums. |
| Jarak | Panel 24px, celah utama 20px dan padding konten desktop 28px; ponsel memakai padding konten 16px dan panel 20px agar ruang baca tetap cukup. |
| Bentuk | Panel 24px, input 14px, tombol utama pill, thumbnail 13px. Variasi membedakan area informasi, tempat mengisi dan aksi sesuai referensi. |
| Elevasi | Bayangan pendek dan tipis pada panel putih serta menu aktif memisahkan permukaan dari kanvas; tanpa glow, glass atau bayangan besar pada semua elemen. |
| Ikon dan foto | Kalender untuk event, orang untuk peserta, dompet untuk pendapatan, checklist untuk kehadiran dan award untuk sertifikat. Memakai Lucide yang sudah dipakai aplikasi agar kontrol konsisten. Cover agenda memakai EventCover dan sumber admin yang sama dengan katalog. |
| Interaksi | Hover warna 140ms, fokus keyboard 2px dan keadaan selected/disabled tetap mengikuti sistem interaksi sebelumnya. Tidak menambah animasi dekoratif. |
| Cakupan | Tema dipasang melalui shell admin/peserta. Halaman publik tetap memakai tema sebelumnya. Navigasi, peran, API, migrasi, dependensi dan data produksi tidak diubah. |

QA menemukan select native tersembunyi pada tabel pengguna menyebabkan overflow ponsel, dua kolom pencarian masih berfont kecil dan aturan fokus input tertimpa specificity stylesheet lama. Posisi relatif pada Field, ukuran input 16px/48px dan aturan fokus yang dibatasi konten workspace memperbaikinya. Jumlah rupiah dalam tabel tidak terpotong ke beberapa baris. Panel riwayat kosong tidak dipaksa setinggi panel pembayaran.

## Verifikasi

Build produksi final lulus kompilasi, lint, tipe dan prerender tanpa peringatan. Seluruh 85 tes yang ada lulus; tidak menambah tes permanen untuk penyesuaian visual ini.

Browser Edge headless menjalankan komponen asli dan CSS build produksi dengan data/transport fixture lokal berlabel. Enam belas kondisi pada lima lebar 360/390/768/1024/1440 menghasilkan 80 pemeriksaan: ringkasan, laporan, dashboard peserta, perjalanan event, daftar event admin, transaksi, CMS, artikel, editor event, profil, pengguna, peserta, monitoring sertifikat, sertifikat peserta serta ringkasan dan dashboard kosong. Tidak ada overflow dokumen; input yang terlihat berfont minimal 16px dan tinggi minimal 44px. Screenshot desktop/ponsel diperiksa secara visual.

Tiga belas catatan aksi di tmp/workspace-style-qa.json membuktikan perhitungan data ringkasan, cover termuat, tautan antrean/agenda/transaksi, filter periode/ekspor CSV, CTA peserta, pembaruan hitungan sertifikat, dashboard kosong, perjalanan peserta, draft profil/dropdown/fokus keyboard, reset filter event, delapan langkah editor/pratinjau/Escape/fokus kembali, hover tombol, reduced-motion/forced-colors serta pembatasan tema publik. Beranda dan katalog diperiksa pada 390/1440; token judul publik tetap #211052. Console/page errors kosong.

Regresi sidebar final: 15 kombinasi tiga peran pada lima ukuran, 66 klik tujuan, buka/tutup kelompok, collapse, pencarian, logout transport lokal, drawer ponsel, 35 Tab dengan focus trap, Escape/fokus kembali, layar pendek 390x568, reflow 720px, reduced-motion dan forced-colors lulus. Kontras teks normal sidebar 5,33:1, aktif 8,81:1; label/angka metrik 15,41:1 dan teks pendukung 5,91:1 pada putih. Focus ring 2px solid ungu. Border input #8e8b95 membedakan kontrol dari permukaan netral.

Bukti: tmp/workspace-style-qa.json, tmp/workspace-sidebar-qa.json, tmp/workspace-style-test.log, tmp/workspace-style-final.log, tmp/workspace-admin-rich-1440.png, tmp/workspace-participant-rich-1440.png, tmp/workspace-overview-390.png, tmp/workspace-dashboard-390.png dan tmp/workspace-profile-390.png. Fixture mengisolasi akun dan transport, sehingga hasil ini tidak mengklaim transaksi atau akun produksi diuji. Tidak mengunggah foto atau mengubah data produksi untuk QA.

## Delivery Gate

- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS: 80 kondisi workspace dan 15 sidebar tanpa overflow; tabel tetap dapat digulir di dalam wadahnya.
- R-17 PASS: metrik dihitung dari state pendaftaran/pembayaran/sertifikat, diverifikasi dengan data fixture yang diketahui.
- R-18 PASS: tidak menambah testimonial, orang atau avatar fiktif.
- R-23 PASS: logo, cover event dan navigasi yang disetujui tetap digunakan; data uji hanya pada fixture lokal berlabel.
- R-24 PASS: tujuan antrean/agenda/transaksi/aktivitas dan 66 klik navigasi sidebar diverifikasi.
- R-25 PASS: kontras terukur teks workspace minimal 5,91:1, sidebar 5,33:1; fokus 2px solid dan border kontrol terlihat.
- R-26 PASS: aksi dan kontrol yang berubah diuji, termasuk filter, dropdown, ekspor, pratinjau dan CTA peserta; handler bisnis lama dipertahankan.
- R-27 PASS: dashboard baru, agenda/transaksi kosong, form dan session loading/error/retry tetap tersedia.
- R-28 PASS: FAQ publik tidak diubah.
- R-32 PASS: keyboard Tab/Shift+Tab/Enter/Escape, drawer focus trap dan fokus kembali lulus.
- R-33 PASS: perubahan aplikasi ditulis pada source melalui apply_patch; skrip hanya bundle fixture dan QA lokal.
- R-34 PASS: tema terang sesuai referensi pengguna; tidak menambah toggle tema; reduced-motion dan forced-colors diuji.
- R-35 PASS: build final, 85 tes, 80 pemeriksaan workspace, 13 catatan aksi dan regresi sidebar lulus.
- R-36 PASS: tidak membuat klaim keamanan/kinerja/pelanggan; batas fixture dan deployment dinyatakan.
- R-37 PASS: referensi dan cakupan dashboard admin/peserta disetujui pengguna; dials 1/1/1 meneruskan arah sidebar.
- R-38 PASS: data realistis hanya fixture berlabel; tampilan produk memakai state asli, tanpa tren palsu.
- R-01 PASS: tanpa gradient atau glow baru.
- R-04 PASS: relevansi setiap ikon baru dicatat pada tabel keputusan; memakai set aplikasi yang sama.
- R-06 PASS: alasan Inter dan angka tabular dicatat, tanpa font baru atau uppercase dekoratif.
- R-07 PASS: kanvas abu netral tanpa grid/dot/blueprint dekoratif.
- R-08 PASS: tidak menambah panah CTA.
- R-09 PASS: label langkah menerangkan tindakan peserta, status agenda berasal dari publikasi event; tidak menambah badge pemasaran atau badge di atas H1.
- R-10 PASS: tidak menambah glass; backdrop header peserta dihapus agar sesuai permukaan referensi.
- R-12 PASS: bayangan pendek membantu pemisahan panel dan menu aktif; tidak menggunakan bayangan besar.
- R-13 PASS: tidak ada glow baru.
- R-14 PASS: ringkasan, daftar agenda, tabel dan langkah peserta memiliki ukuran sesuai isi dan tugasnya.
- R-19 PASS: perubahan warna/border 140ms tanpa scale/shift/dekorasi berulang; reduced-motion menonaktifkan transisi.
- R-22 PASS: tidak menambah ilustrasi generik; thumbnail adalah cover event sebenarnya.
- Liveliness dials PASS: ENERGY/RHYTHM/MOTION 1/1/1 dinyatakan dan dijaga.
- Liveliness focus PASS: admin berfokus ringkasan operasional; peserta berfokus tindakan berikutnya.
- Liveliness spacing PASS: panel dan celah memisahkan ringkasan, agenda, transaksi serta riwayat tanpa memaksa tinggi sama.
- Liveliness accent PASS: ungu hanya pada tindakan, status dan keadaan aktif; permukaan netral.
- Liveliness identity PASS: logo Awan Event, submenu melengkung dan aksen ungu menjadi pola identitas berulang.
- Liveliness Design Read PASS: arah mengikuti gambar referensi pengguna dan cakupan dashboard yang dikonfirmasi sebelum penyelesaian.
- C-1 PASS: warna, komposisi, font, jarak, bentuk, ikon dan motion punya alasan pada tabel keputusan.
- C-2 PASS: tautan dan kontrol yang berubah mempertahankan tujuan/handler dan diuji klik.
- C-3 PASS: panel berasal dari tugas kegiatan/pembayaran/peserta, bukan chart atau feed pengisi ruang.
- C-4 PASS: data kosong/terisi, peran, ponsel/desktop, keyboard dan preferensi aksesibilitas diperiksa.
- C-5 PASS: metrik berasal dari data aplikasi; bukti QA dibedakan dari data produksi.
- R-05 PASS: komposisi mengikuti kebutuhan admin dan peserta; laporan tetap lebar penuh untuk keterbacaan data.
- R-11 PASS: radius panel/input/thumbnail/tombol berbeda sesuai fungsinya, angka dicatat pada keputusan.
- R-15 PASS: CTA menyebut Buat event, Lihat jadwal event, Isi evaluasi acara atau tindakan aktual dari nextAction.
- R-16 PASS: tidak menambah buzzword pemasaran.
- R-20 PASS: identitas Awan Event dipertahankan melalui brand, warna, event dan perjalanan kegiatan.
- R-21 PASS: tema terang mengikuti referensi eksplisit pengguna; tema gelap tidak termasuk cakupan permintaan.
- R-29 PASS: putih/abu/gelap netral dengan satu aksen ungu; merah/hijau tetap untuk status operasional.
- R-30 PASS: adaptasi referensi diminta pengguna; tidak meniru produk populer lain atau menyalin isi dagang pada referensi.
- R-31 PASS: alasan keputusan utama dan perbaikan hasil QA terdokumentasi.

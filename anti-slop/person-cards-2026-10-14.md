# Kartu pemateri dan tim

Referensi: gambar kartu Headliners yang dilampirkan pengguna pada 14 Oktober 2026. Arahnya foto besar, sudut membulat, judul bagian terpusat, dan nama/jabatan pada panel bawah berwarna. Revisi pengguna: foto harus berwarna asli, menggantikan efek hitam-putih pada referensi. Ungu #5B3CC4 serta font Awan Event dipertahankan. ENERGY 2 / RHYTHM 2 / MOTION 1. Pengguna meminta foto yang belum tersedia dibuat sebagai skeleton terlebih dahulu.

## Penerapan

PersonCard dan PersonGrid dipakai bersama oleh daftar pemateri beranda, bagian pemateri/moderator detail event, dan enam anggota tim di About Us. Grid mengikuti lebar kontainer: satu kolom, dua kolom mulai 600px, dan tiga kolom mulai 940px. Satu atau dua pemateri ditempatkan di tengah dengan lebar terbatas. Nama panjang membungkus, tidak dipotong. Bio dan institusi yang sudah ada tetap tersedia. Peran mengikuti data pemateri; pemateri terakhir tidak lagi otomatis dianggap moderator.

Foto kosong atau gagal dimuat menampilkan skeleton statis dengan label Foto belum tersedia, bukan animasi loading tanpa akhir. Foto yang tersedia tampil dengan warna aslinya tanpa filter, termasuk thumbnail CMS. Tidak ada foto orang baru, identitas fiktif, atau aset hasil generasi.

Admin > Konten website > Tim menyediakan unggah dan hapus foto per anggota, serta pratinjau kartu. Foto tetap memakai endpoint upload yang ada. Penyimpanan memakai enam record CMS TeamMember-1 sampai TeamMember-6 melalui transaksi update yang ada, tanpa migrasi database. API hanya menambahkan enam key tersebut ke daftar yang diizinkan, tetap membatasi tulisan CMS untuk superadmin dan request dengan Origin yang sama.

## Bukti pemeriksaan

- Build produksi lulus sebelum revisi filter warna: 49 halaman, pemeriksaan lint dan TypeScript lulus. Revisi warna hanya menghapus grayscale pada foto kartu dan thumbnail CMS; pemeriksaan browser diulang pada server development dan filter keduanya terverifikasi none.
- Lint mandiri dan typecheck lulus sebelum build; build memeriksa source final.
- 14 tes lulus. Tiga tes baru menguji route PATCH asli: publikasi enam slot, penolakan key sembarang/URL berbahaya, serta batas superadmin dan Origin.
- Browser pada build produksi: lebar 360, 390, 768, 1024 dan 1440px. About, pemateri event dan CMS tidak memiliki overflow dokumen; nama panjang tidak melewati kontainer.
- Enam nama/jabatan tim berasal dari companyProfile yang sudah ada. Semua foto tim yang kosong menampilkan skeleton.
- Beranda menampilkan kartu dari pemateri event published. Detail event diuji dengan 0, 1, 2 dan 3 pemateri, bio, nama panjang, foto tersedia dan URL foto gagal.
- 180 pemeriksaan teks kartu berdasarkan computed styles lulus 4.5:1. Panel ungu dan badge memakai putih pada #5B3CC4, tanpa opacity yang mengurangi keterbacaan.
- CMS diuji dengan provider terisolasi: pilih Tim, unggah, pratinjau, kembali Edit, simpan, hapus foto, dan pesan kegagalan unggah. Payload diperiksa dengan contentSchema asli. Tidak ada foto/data yang disimpan ke layanan produksi.
- Tidak ada page error browser. Bukti lokal: tmp/people-results.json, tmp/people-team-1440.png, tmp/people-team-390.png, tmp/people-event-1440.png dan tmp/people-event-390.png. Nama pemateri pada fixture hanya untuk pengujian, tidak masuk source produksi.

## Delivery Gate

Gate ini berlaku pada perubahan kartu dan kontrol foto tim, bukan sertifikasi seluruh aplikasi.

### Hard Gate

- R-02 PASS: teks baru tidak memakai em dash.
- R-03 PASS: lima lebar diuji; kontainer berubah menjadi 1/2/3 kolom; nama panjang membungkus.
- R-17 PASS: tidak ada statistik baru.
- R-18 PASS: tidak ada testimoni atau foto identitas rekaan.
- R-23 PASS: skeleton diminta pengguna; tidak ada aset foto baru dibuat.
- R-24 PASS: tidak mengubah route navigasi; pratinjau memakai /about#tim yang tersedia.
- R-25 PASS: 180 pasangan warna teks kartu lulus minimal 4.5:1.
- R-26 PASS: unggah, hapus, pratinjau dan simpan diuji melalui handler asli dengan layanan fixture.
- R-27 PASS: foto kosong dan gagal memuat ditangani; error unggah diumumkan sebagai alert.
- R-28 PASS: tidak menambahkan FAQ.
- R-32 PASS: label input terhubung lewat Field; kontrol memakai input/button native dengan focus indicator yang ada.
- R-33 PASS: TSX/CSS ditulis melalui patch; skrip hanya untuk QA.
- R-34 PASS: tetap menggunakan tema terang aplikasi; tidak menambahkan theme toggle.
- R-35 PASS: build dan browser produksi dijalankan, semua kontrol baru diuji dan tanpa page error.
- R-36 PASS: tidak menambahkan klaim pemasaran atau keamanan.
- R-37 PASS: bentuk mengikuti referensi pengguna dan palet brand yang aktif.
- R-38 PASS: nama dan jabatan tim berasal dari data yang sudah ada; fixture terisolasi.

### Purpose-Gate

- R-01 PASS: ungu solid mengikat panel nama dengan brand; tidak menambahkan gradient.
- R-04 PASS: Save/Eye/Pencil yang ada tetap menunjukkan tindakan; skeleton menunjukkan tempat foto.
- R-06 PASS: font brand dipertahankan; uppercase pada panel identitas mengikuti referensi, jabatan 12px dengan tracking terbatas.
- R-07 PASS: tidak menambahkan pola background.
- R-08 PASS: tidak menambahkan panah dekoratif.
- R-09 PASS: badge hanya menampilkan peran pemateri yang ada, tanpa klaim Keynote rekaan.
- R-10 PASS: panel solid tanpa blur.
- R-12 PASS: shadow ringan hanya memisahkan kartu portrait dari surface; tidak menaikkan seluruh section.
- R-13 PASS: tidak ada glow.
- R-14 PASS: grid seragam membandingkan profil orang sesuai referensi; jumlah kolom mengikuti ruang dan jumlah profil.
- R-19 PASS: skeleton statis dan foto tanpa gerak berulang sesuai MOTION 1.
- R-22 PASS: tidak menambah ilustrasi stok; placeholder foto dinyatakan secara eksplisit.

### Liveliness

- Dials PASS: ENERGY 2 / RHYTHM 2 / MOTION 1 mengikuti referensi portrait dan panel nama yang tegas.
- Consistency PASS: aksen ungu pada identitas, tanpa animasi skeleton.
- Focal point PASS: nama pada panel ungu dan foto/skeleton besar menjadi fokus kartu.
- Whitespace PASS: ruang antara judul dan grid, gap 24px antar kartu, padding identitas 24px.
- Accent PASS: hanya ungu brand dan abu-abu netral pada komponen baru.
- Identity PASS: panel ungu, Plus Jakarta Sans dan nama tim Awan Event.
- Design Read PASS: bentuk referensi, palet dan penggunaan skeleton dijelaskan sebelum implementasi.

### Craftsmanship dan Quality Locks

- C-1 PASS: alasan bentuk, warna, font dan skeleton tercatat di atas.
- C-2 PASS: seluruh kontrol baru berhasil pada fixture; validasi route diuji terpisah.
- C-3 PASS: hanya mengganti section pemateri/tim dan menambahkan pengelolaan foto yang dibutuhkan.
- C-4 PASS: empty, foto rusak, nama panjang, upload gagal dan lima viewport diuji.
- C-5 PASS: tidak menambahkan identitas atau bukti sosial baru.
- R-05 PASS: urutan halaman dipertahankan; hanya layout profil mengikuti permintaan pengguna.
- R-11 PASS: radius kartu 24px, thumbnail 12px, badge peran pill.
- R-15 PASS: tindakan menyebut Hapus foto, Pratinjau, Edit, Simpan & terbitkan.
- R-16 PASS: tidak menambahkan jargon pemasaran.
- R-20 PASS: identitas ungu dan tipografi Awan Event dipertahankan.
- R-21 PASS: portrait netral dan halaman terang sesuai arah yang aktif.
- R-29 PASS: palet komponen terbatas pada ungu, putih dan abu-abu.
- R-30 PASS: bentuk kartu mengikuti referensi eksplisit pengguna, tanpa menyalin brand atau kontennya.
- R-31 PASS: alasan keputusan besar tercatat dalam penerapan dan arah.

## Status

Pengguna meminta commit dan push revisi ini ke origin/main pada 14 Oktober 2026. Pratinjau build produksi lokal tersedia pada http://127.0.0.1:3000/about#tim. Deployment pada awanevent.com belum diverifikasi. Upload dan penyimpanan remote dengan akun produksi belum diuji; bukti CMS menggunakan fixture terisolasi dan tes route tanpa koneksi database remote.

# Cover beranda dan halaman Event, 16 Oktober 2026

Permintaan: menyamakan gambar event di landing page dan halaman Event. Sebelumnya FeaturedPrograms membaca cover admin, sedangkan EventCard pada katalog menggambar ilustrasi tanggal. Arah mengikuti kartu Awan Event yang sudah ada, ENERGY 1 / RHYTHM 1 / MOTION 1; perubahan berfokus pada media kartu.

## Perubahan

- EventCover dipakai bersama oleh FeaturedPrograms dan EventCard. Sumber tetap eventVisual: banner admin, gambar Hero legacy jika banner kosong, lalu logo Awan Event. Sumber berubah melalui state yang sudah tersinkron; tidak menambah field, endpoint atau database.
- Ilustrasi tanggal, silang, lingkaran dan gradient di panel gambar katalog dihapus. Tanggal dan format event tetap berada pada informasi kartu yang sudah ada. Cover menjadi foto/poster unggahan admin dengan alt kosong karena judul event tersedia di dekatnya.
- Frame beranda dan katalog sama-sama 16:9, object-fit cover dan object-position center, termasuk beranda satu event dan ponsel. Cover tanpa gambar/gagal dimuat menampilkan logo yang sama; pergantian URL valid tetap dapat menampilkan cover baru setelah kegagalan sebelumnya.
- Petunjuk admin mencantumkan penggunaan yang sama pada beranda, halaman Event dan dashboard, serta ukuran rekomendasi 1600 × 900 px. Hero detail event tetap teks dengan latar yang sudah ada.

## Bukti

- Build produksi lulus lint, TypeScript dan prerender. Suite 77/77 lulus termasuk dua tes kesamaan render source/fallback serta perubahan cover dengan judul/link tetap.
- Browser headless memakai komponen asli FeaturedPrograms, EventsBrowser, EventCard dan EventCover melalui state fixture lokal. Lima sumber (awal/baru/legacy/kosong/gagal), satu/tiga event, lima viewport 360/390/768/1024/1440 menghasilkan 50 pemeriksaan lulus: URL sama, rasio 16:9 dengan toleransi 0,01, center/cover sama dan tanpa overflow.
- Penggantian source lewat kontrol fixture tidak reload; gambar rusak berganti logo, kemudian URL baru kembali tampil. Semua gambar selesai dimuat dengan naturalWidth > 0. Ilustrasi silang/lingkaran katalog nol dan page errors kosong. Data fixture berlabel pengujian; tidak mengunggah/mengubah cover produksi.
- Bukti tmp/unified-cover-1440.png, tmp/unified-cover-390.png dan tmp/unified-cover-qa.json. Tidak menambah dependency/aset foto atau testimoni.

## Delivery Gate

PASS untuk sinkronisasi cover ini. Hard Gate R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38: data/gambar berasal dari admin atau logo yang ada, fixture berlabel, lima viewport/empty/error/update teruji, link dan judul tetap, tidak menambah teks di atas foto, kontrol admin memakai label dan pola existing, source dipatch langsung dan tidak mengubah tema/akses.

Purpose Gate R-01/04/06/07/08/09/10/12/13/14/19/22 PASS: menghapus dekorasi ilustrasi dari panel gambar katalog, tidak menambah gradient/ikon/badge/shadow/animasi. Frame memakai radius 18px dari kartu beranda dan gambar nyata milik event. Dials/liveliness PASS: satu media utama per kartu, aksen/ruang/typografi sistem yang ada, komposisi publik tetap mengikuti isi.

Craftsmanship C-1..5 dan R-05/11/15/16/20/21/29/30/31 PASS: sumber tunggal menyelesaikan perbedaan cover, fallback berfungsi, satu/tiga kartu dan ponsel teruji, tidak menciptakan identitas atau klaim. Audit ini tidak mencakup ulang seluruh desain katalog.

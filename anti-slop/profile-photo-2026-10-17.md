# Foto profil dan sapaan peserta

Status: PASS. Arah mengikuti dashboard Awan Event yang sudah disetujui pengguna: putih/abu, aksen ungu, Inter, ENERGY 1 / RHYTHM 1 / MOTION 1. Tujuan halaman profil adalah memperbarui identitas sendiri; tujuan sapaan adalah menghubungkan dashboard dengan akun yang sedang masuk.

## Perubahan

- Profil saya menyediakan unggah, pratinjau, ganti dan hapus foto opsional. Foto baru dikirim saat Simpan profil ditekan. Batalkan perubahan memulihkan data tersimpan, termasuk foto. Formulir bersama melayani peserta dan kedua peran admin; foto tidak menjadi syarat pendaftaran dan tidak menambah langkah pada formulir pendaftaran inline.
- Sapaan peserta menempatkan foto lingkaran 68px di sebelah nama, menjadi 54px pada ponsel. Label Ruang peserta dan judul tersusun dalam satu kelompok identitas; tindakan Jelajahi event tetap terpisah. Kelompok identitas menjadi tautan berlabel Edit foto dan profil saya. Foto yang sama muncul pada identitas sidebar admin/peserta. Akun tanpa foto atau gambar yang gagal dimuat memakai inisial nama asli.
- Penyunting foto menyatu dengan panel Informasi utama, tanpa kartu tambahan. Pratinjau 88px, atau 76px pada ponsel, dengan garis ungu lembut. Penjelasan crop, format dan batas ukuran tersedia di dekat kontrol. Tombol berukuran sentuh minimal44px, filename panjang membungkus, kelompok foto ditumpuk pada lebar kecil. Nama panjang pada sapaan juga membungkus.
- Inter, warna netral, radius panel dan hover/fokus meneruskan sistem dashboard. Lingkaran dipakai untuk identitas orang; radius panel dan tombol mengikuti fungsi masing-masing. Tidak menambah glow, gradient, ilustrasi, ikon dekoratif, badge, shadow baru atau animasi berulang. Motion hanya mengikuti interaksi yang sudah tersedia.

## Penyimpanan dan batas

Profile.avatarUrl opsional menjaga kompatibilitas data lama. PATCH profil tetap memeriksa sesi, email pemilik, role dari server, revision dan rate limit. Referensi foto baru wajib berasal dari origin penyimpanan aplikasi dan direktori avatars/<id pengguna sesi>/ dengan nama acak. URL luar, jalur akun lain, URL data/SVG, query dan fragmen ditolak. Klien lama yang tidak mengirim avatarUrl mempertahankan foto tersimpan.

POST /api/profile/photo terpisah dari unggah admin dan menerima semua pengguna terautentikasi untuk fotonya sendiri. Route menerapkan same-origin, pembatasan10permintaan/menit/pengguna, pembacaan body berbatas, validasi format PNG/JPEG/WebP dari byte serta decoding gambar sebenarnya. Ukuran sumber maksimal5MB/25megapiksel. Sebelum unggah, browser memotong bagian tengah dan mengecilkan foto menjadi512px; server tetap memvalidasi dan mengolah ulang menjadi512x512 WebP, mengoreksi orientasi dan membuang metadata sumber. Sharp yang sudah menjadi dependensi transitif Next kini dinyatakan sebagai dependensi langsung pada versi terpasang0.35.5, tanpa mengganti versi tersebut.

Penyimpanan memakai bucket event-assets yang sudah ada dengan nama file acak baru setiap unggahan, sehingga foto pengganti tidak memakai cache foto sebelumnya. Tidak memerlukan migrasi. Foto menjadi URL publik tak tertebak pada bucket tersebut; snapshot peserta tetap hanya memuat profil akun sendiri. Hapus foto menghapus referensi dari profil, bukan menghapus versi berkas terdahulu secara fisik dari bucket. Unggahan yang sudah berhasil dipakai ulang jika PATCH gagal agar retry tidak mengunggah berulang. Draft dan unggahan dibatalkan saat akun berganti; object URL pratinjau dibebaskan sesudah tidak dipakai.

Tidak ada perubahan pada akun, email, SMTP atau data peserta produksi. Pengujian browser menggunakan gambar warna solid berlabel uji lokal dan transport autentikasi/penyimpanan lokal, bukan foto atau identitas pelanggan.

## Verifikasi

- Build produksi lulus kompilasi, lint, tipe, prerender dan penelusuran dependensi, termasuk route foto baru. Seluruh107tes lulus. Tujuh tes baru meliputi decoding/crop/orientasi/metadata tiga format, batas byte/piksel dan gambar rusak, namespace pemilik, tiga peran, autentikasi/origin/throttling/storage503, kompatibilitas profil lama, penolakan URL asing, hapus foto tanpa menghapus biodata, dan isolasi draft saat akun berganti.
- Browser Edge menjalankan ProfileEditor, PlatformProvider, ParticipantWorkspace, AppSidebar dan shell asli dengan CSS produksi. Endpoint upload dan PATCH asli dipakai melalui transport lokal. Dua puluh kombinasi halaman/peran/lebar360/390/768/1024/1440 lulus tanpa overflow. Foto tersimpan512px dimuat kembali setelah reload; sidebar langsung mengikuti hasil simpan.
- Enam kelompok tindakan foto lulus: preview lokal tanpa request unggah, batal, penggabungan refresh dengan draft; pending/disabled dan persist; ganti foto dengan PATCH gagal lalu retry tanpa unggah ganda; hapus/batal/simpan dengan biodata tetap; MIME/ukuran/berkas palsu/storage503 dan retry; pergantian akun saat upload, fallback gambar404, nama panjang, pintasan keyboard, reduced-motion dan forced-colors. Dua respons404 sengaja dibuat untuk memeriksa fallback foto hilang; error browser lain tidak ada. Decoding gambar berbahaya di server diuji langsung pada tes route/unit.
- Foto/teks identitas tidak saling menutupi; rasio lingkaran, posisi di sebelah sapaan dan target44px diperiksa lewat bounding box. Kontras inisial ungu pada lavender7,40:1 dan teks sekunder pada canvas5,33:1 mengikuti pasangan warna dashboard yang sudah terukur. Fokus solid2px tetap terlihat; avatar tidak mengulang nama pada pembaca layar.
- Regresi profil lama juga lulus15kombinasi tiga peran/lima ukuran dan7kelompok tindakan: simpan/reload, merge draft, gagal/retry, isolasi akun, formulir pendaftaran inline, nama di daftar akun, sidebar kecil44px, keyboard, reduced-motion dan forced-colors. Console/page errors kosong. Bukti: tmp/profile-photo-regression.log dan tmp/self-profile-qa.json.
- Uji tambahan dengan sumber PNG4.959.947byte menghasilkan request unggah122.550byte setelah crop/kompresi browser. Gagal jaringan mempertahankan draft dan retry berhasil. Tap pada sapaan membuka profil dan tombol Ganti foto membuka pemilih berkas asli pada mode sentuh. Empat screenshot viewport dari bagian atas halaman profil/dashboard diperiksa visual pada390/1440px. Error halaman kosong; bukti tmp/profile-photo-extra-qa.json, tmp/profile-photo-extra.log dan tmp/profile-photo-final-*.png.
- Bukti lokal: tmp/profile-photo-tests.log, tmp/profile-photo-build.log, tmp/profile-photo-qa.json, tmp/profile-photo-browser.log serta screenshot tmp/profile-photo-*.png. Screenshot yang mengandung akun uji tidak dimasukkan ke produk.

## Delivery Gate

- R-01 PASS: tanpa gradient atau dekorasi latar baru.
- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS:20kombinasi responsif, nama/filename panjang dan tombol tetap dalam wadah.
- R-04 PASS: tanpa emoji atau ikon dekoratif baru.
- R-05 PASS: satu kelompok foto pada formulir yang sudah ada; tanpa template pemasaran.
- R-06 PASS: Inter dan skala heading dashboard dipertahankan untuk kontinuitas ruang kerja.
- R-07 PASS: tanpa grid/dot/blueprint dekoratif.
- R-08 PASS: tanpa panah CTA.
- R-09 PASS: Ruang peserta berupa label teks, bukan pill yang mengulang judul.
- R-10 PASS: tanpa glass baru.
- R-11 PASS: lingkaran untuk orang, radius panel/tombol menurut fungsi.
- R-12 PASS: tanpa shadow baru.
- R-13 PASS: tanpa glow atau lampu status dekoratif.
- R-14 PASS: foto menyatu dengan Informasi utama, tanpa panel berlapis tambahan.
- R-15 PASS: Unggah foto, Ganti foto, Hapus foto dan Simpan profil menyatakan tindakan.
- R-16 PASS: penjelasan singkat menyebut format, ukuran dan crop; tanpa buzzword.
- R-17 PASS: tidak menambah statistik atau klaim kapasitas produk.
- R-18 PASS: tidak membuat orang/testimonial fiktif di produk.
- R-19 PASS: tidak menambah animasi berulang; motion interaksi mengikuti dial1.
- R-20 PASS: memperluas identitas dashboard Awan Event yang disetujui.
- R-21 PASS: tema terang mengikuti arahan pengguna sebelumnya.
- R-22 PASS: foto berasal dari unggahan pengguna yang diminta; gambar uji hanya pada fixture.
- R-23 PASS: fallback inisial dari nama akun, tanpa foto/avatar orang rekaan.
- R-24 PASS: tautan sapaan menuju /dashboard/profile yang tersedia.
- R-25 PASS: pasangan teks minimal5,33:1, fokus2px dan kontrol44px diperiksa.
- R-26 PASS: unggah/ganti/hapus/batal/simpan dan tautan profil bekerja nyata.
- R-27 PASS: preview, pending, sukses, gagal/retry, foto kosong/rusak dan akun berganti tersedia.
- R-28 PASS: tidak mengubah FAQ.
- R-29 PASS: palet netral dan ungu dashboard dipertahankan.
- R-30 PASS: memakai sistem dashboard sendiri, tanpa menyalin produk lain.
- R-31 PASS: fungsi lingkaran, outline, warna, layout, ukuran dan motion dijelaskan di atas.
- R-32 PASS: kontrol bernama, avatar dekoratif terhadap nama di dekatnya, keyboard/fokus diuji.
- R-33 PASS: source diubah melalui apply_patch; fixture dan bukti terpisah dari source produk.
- R-34 PASS: reduced-motion, forced-colors, desktop dan ponsel diperiksa.
- R-35 PASS: build,107tes,20kombinasi dan6kelompok aksi foto lulus.
- R-36 PASS: pengujian lokal dibedakan dari transaksi/foto pelanggan produksi.
- R-37 PASS: arah yang disetujui dan dials1/1/1 dijelaskan sebelum implementasi.
- R-38 PASS: nama/gambar uji hanya pada fixture berlabel, data produk memakai akun sesi.
- Liveliness dials PASS: ENERGY1/RHYTHM1/MOTION1 sesuai formulir akun.
- Liveliness focus PASS: identitas di dekat sapaan, Simpan profil menjadi aksi perubahan utama.
- Liveliness spacing PASS: identitas, isian dan footer dipisah menurut fungsi, reflow ponsel nyata.
- Liveliness accent PASS: ungu menandai inisial, garis foto, fokus dan aksi utama.
- Liveliness identity PASS: foto akun yang sama dipakai pada profil, sapaan dan sidebar.
- Liveliness Design Read PASS: arahan dashboard yang sudah disetujui dipertahankan.
- C-1 PASS: alasan bentuk, warna, tipografi, layout dan motion dicatat.
- C-2 PASS: setiap kontrol baru memiliki perilaku yang diuji, tanpa tombol kosong.
- C-3 PASS: foto opsional membantu identitas akun tanpa menambah syarat registrasi.
- C-4 PASS: tiga peran, lima lebar, state kosong/rusak/pending/gagal/retry, keyboard dan pergantian akun diuji.
- C-5 PASS: tidak menambah klaim, orang atau data fiktif dalam produk.

# Edit profil peserta dan admin, 17 Oktober 2026

Status: PASS untuk fitur edit profil diri sendiri. Arah mengikuti dashboard putih/abu dan ungu Awan Event yang telah disetujui pengguna, ENERGY 1 / RHYTHM 1 / MOTION 1. Tugas halaman: memperbarui identitas/kontak akun lalu menyimpan perubahan dengan jelas.

## Implementasi dan keputusan

- Peserta memakai /dashboard/profile yang sudah ada, kini berjudul Profil saya dengan ringkasan nama/peran, Simpan profil, Batalkan perubahan dan akses pemulihan kata sandi. Biodata lengkap tetap diperlukan untuk pendaftaran event.
- Halaman baru /admin/profile memakai ProfileEditor yang sama. Super Admin dan Admin Operasional dapat menyimpan nama serta kontak, institusi, jabatan dan domisili opsional; admin tidak diwajibkan mengisi data kelahiran/sumber webinar untuk menyunting namanya.
- Navigasi admin memiliki Profil saya. Identitas akun pada footer sidebar menjadi tautan Edit profil saya untuk kedua area, termasuk mode kecil dan drawer ponsel. Menu eksplisit membantu pencarian, sedangkan identitas footer menyediakan pintasan akun yang selalu terlihat.
- Server memilih profileSchema atau adminProfileSchema dari app_metadata pengguna terautentikasi. Semua peran tetap hanya boleh menulis profil dengan ID email sendiri. Email disetel dari sesi server; klaim role pada payload atau user_metadata tidak mengendurkan validasi peserta. Endpoint yang sama mempertahankan same-origin, rate limit, revision dan penyimpanan atomik yang sudah ada.
- Merge draft yang sudah ada dipertahankan: polling/fokus mengambil perubahan kolom yang belum diedit, menyimpan edit lokal dan mengisolasi akun saat sesi berubah. Batalkan perubahan memakai data tersimpan terbaru. Gagal simpan mempertahankan isian untuk dicoba kembali; saat simpan fieldset disabled dan aria-busy.
- Nama pada sidebar dan halaman Akun & peran mengikuti profil platform yang tersimpan. Daftar akun tetap mempertahankan kontrol peran/identitas akun terpisah. Tidak menulis user_metadata Auth atau mengubah peran saat menyimpan profil.
- Email akun tetap hanya dibaca. Nama pendaftaran dan sertifikat yang sudah tersimpan tidak ditulis ulang oleh edit profil. Tombol Ubah kata sandi mengarah ke alur pemulihan yang sudah ada, tanpa pengiriman email otomatis saat membuka/menyimpan profil.
- Tipografi memakai Inter yang sudah tersedia, heading 28..36px dan input 16px agar konsisten dengan ruang kerja serta mudah dibaca di ponsel. Heading jelas menggantikan judul onboarding pada kunjungan edit biasa.
- Ringkasan akun memakai inisial dari nama akun asli dengan latar ungu lembut untuk menghubungkan formulir dengan identitas sidebar. Tidak membuat foto/avatar atau identitas rekaan di produk. Radius 16px pada inisial dan 24px panel meneruskan hierarki dashboard; dua panel membedakan informasi pribadi dan akses akun.
- Hover warna 140ms dan fokus 2px mengikuti token existing, tanpa animasi dekoratif. Layout dua kolom berubah menjadi satu kolom di ponsel, grup tombol dapat bertumpuk. Target identitas pada sidebar kecil 44x44px.

Tidak ada dependensi, migrasi, perubahan SMTP/DNS atau perubahan data akun produksi. Foto profil dan penggantian alamat login bukan bagian implementasi ini. Data autentikasi tidak disimpan pada storage browser untuk fitur baru ini.

## Verifikasi

Build produksi lulus kompilasi, lint, tipe dan prerender termasuk /admin/profile. Seluruh 91 tes lulus. Enam tes baru menjalankan route PATCH dengan validasi/guard nyata serta tampilan SSR: tiga peran menyimpan profil sendiri, email sesi dipaksakan, properti role tidak tersimpan, admin dapat simpan pertama kali tanpa biodata peserta, data peserta lama tetap tersimpan, klaim role palsu gagal, edit akun lain/same-origin/anonim ditolak, nilai invalid/revision usang/throttling tidak menulis, serta field admin/peserta dan tujuan pemulihan benar. Tes navigasi kini memeriksa Profil saya untuk admin operasional dan tujuan route baru.

Edge headless menggunakan komponen ProfileEditor, PlatformProvider, AdminShell, ParticipantShell, AppSidebar, RegistrationWizard dan UsersAdmin asli serta CSS build. Transport Auth dan penyimpanan dibuat lokal dengan label akun uji; request HTTP profil melewati handler PATCH, schema dan ownership asli. Tidak melakukan perubahan pada akun produksi.

Lima belas kombinasi tiga peran pada lebar360/390/768/1024/1440 lulus tanpa overflow, termasuk nama draft panjang, pembatalan dan akses profil footer desktop/ponsel. Field terlihat minimal16px/44px. Tujuh kelompok tindakan membuktikan save pending/disabled, persist sesudah reload, sidebar langsung berubah, admin tidak diwajibkan biodata peserta, tautan pemulihan, refresh fokus menggabungkan kolom jauh tanpa menghapus draft, cancel ke versi terbaru, gagal simpan/retry sekali, isolasi pergantian akun melalui callback Auth provider asli, profil inline pendaftaran berhasil melanjutkan hanya sesudah save, nama profil terbaru di daftar akun, sidebar kecil, keyboard/reduced-motion/forced-colors. Semua lulus dan page/console errors kosong. Kontras inisial 7,40:1, teks peran 5,33:1; fokus ungu solid2px.

Regresi sidebar dengan source final juga lulus:15 kombinasi tiga peran/lima ukuran,70 klik tujuan, pencarian, collapse,35Tab pada drawer, Escape/fokus kembali, layar pendek390x568, reflow720, sesi loading/error/retry, logout fixture, reduced-motion dan forced-colors. Console/page errors kosong. Profil admin tersedia untuk kedua peran admin, sedangkan Sistem tetap khusus Super Admin.

Bukti lokal: tmp/self-profile-tests.log, tmp/self-profile-build.log, tmp/self-profile-qa.json, tmp/workspace-sidebar-qa.json, tmp/self-profile-super-1440.png, tmp/self-profile-super-390.png, tmp/self-profile-participant-390.png dan tmp/self-profile-operational-390.png. Screenshot berisi data fixture, bukan akun pelanggan. Pengujian ini tidak mengklaim pergantian password atau pengiriman email nyata dijalankan kembali.

## Delivery Gate

- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS: tiga peran/lima lebar tanpa overflow; nama panjang dan grup tombol ponsel tetap di wadahnya.
- R-17 PASS: tidak menambah statistik produk atau klaim kapasitas.
- R-18 PASS: tidak menambah testimonial atau orang fiktif di produk.
- R-23 PASS: menggunakan inisial akun yang tersedia dan navigasi profil yang diminta; akun uji hanya pada fixture lokal berlabel.
- R-24 PASS: route /admin/profile tersedia, profil peserta/pemulihan sudah ada, tujuan sidebar diuji.
- R-25 PASS: inisial7,40:1 dan peran5,33:1; input/fokus mengikuti token workspace yang sudah diuji.
- R-26 PASS: Simpan, Batalkan, pemulihan, identitas sidebar dan menu profil memiliki fungsi nyata yang diuji.
- R-27 PASS: loading/error pemuatan, draft, pending, sukses, gagal simpan/retry dan profil baru tersedia.
- R-28 PASS: tidak mengubah FAQ.
- R-32 PASS: label field tetap terhubung, email disabled jelas, keyboard/fokus dan drawer ponsel diuji.
- R-33 PASS: fitur ditulis pada source melalui apply_patch; helper terpisah hanya untuk fixture dan QA.
- R-34 PASS: tema terang yang disetujui dipertahankan, reduced-motion dan forced-colors lulus.
- R-35 PASS: build produksi,91tes serta15kombinasi dan7kelompok aksi browser lulus.
- R-36 PASS: hasil fixture dibedakan dari transaksi akun produksi, tidak mengklaim edit email atau password otomatis.
- R-37 PASS: arah dashboard yang disetujui dipertahankan, dials1/1/1 sesuai tugas formulir.
- R-38 PASS: nama/email uji hanya di transport lokal berlabel; halaman produk memakai profil sesi.
- R-01 PASS: tidak menambah gradient atau glow.
- R-04 PASS: ikon UserRound menandai menu profil, sesuai set yang sudah digunakan aplikasi.
- R-06 PASS: alasan Inter dan skala heading dicatat; kicker ruang kerja memakai huruf normal.
- R-07 PASS: tanpa grid/dot/blueprint dekoratif.
- R-08 PASS: tidak menambah panah CTA.
- R-09 PASS: peran akun berupa teks informasi, tanpa badge pemasaran atau label glow.
- R-10 PASS: tanpa glass baru.
- R-12 PASS: panel memakai bayangan pendek dari tema dashboard existing, tanpa elevasi berlebihan.
- R-13 PASS: tanpa glow baru.
- R-14 PASS: dua panel berbeda tujuan, ringkasan identitas tidak menjadi kartu tambahan berlapis.
- R-19 PASS: hanya hover/fokus dan keadaan pending, tidak ada animasi berulang.
- R-22 PASS: tidak menambah ilustrasi atau foto.
- Liveliness dials PASS: ENERGY/RHYTHM/MOTION1/1/1 dijaga.
- Liveliness focus PASS: formulir dan Simpan profil menjadi tindakan utama; tombol batal muncul sesudah edit.
- Liveliness spacing PASS: identitas, data pribadi dan pemulihan dipisahkan berdasarkan fungsi.
- Liveliness accent PASS: ungu menandai identitas, menu aktif, fokus dan aksi utama pada permukaan putih/abu.
- Liveliness identity PASS: inisial akun dan motif sidebar Awan Event konsisten di kedua area.
- Liveliness Design Read PASS: arah dan cakupan dijelaskan sebelum implementasi, memakai dashboard yang disetujui.
- C-1 PASS: alasan komposisi, bentuk, font, warna, navigasi dan motion dicatat.
- C-2 PASS: kontrol baru diuji dengan HTTP dan komponen asli, tanpa tombol kosong.
- C-3 PASS: form admin mengumpulkan data koordinasi akun, form peserta mempertahankan kebutuhan registrasi.
- C-4 PASS: profil baru/tersimpan, tiga peran, refresh, akun berubah, gagal/retry dan ponsel/desktop diperiksa.
- C-5 PASS: tidak membuat klaim pelanggan atau data produk fiktif.
- R-05 PASS: layout mengikuti data akun dengan kelompok akses akun terpisah, tanpa template pemasaran.
- R-11 PASS: radius panel/input/inisial/tombol bervariasi sesuai fungsinya.
- R-15 PASS: Simpan profil, Batalkan perubahan, Ubah kata sandi dan Muat ulang profil menyebut tindakan jelas.
- R-16 PASS: copy baru tanpa buzzword.
- R-20 PASS: palet, sidebar, font dan alur kegiatan Awan Event dipertahankan.
- R-21 PASS: tema terang mengikuti referensi pengguna untuk ruang kerja, tidak memaksakan tema lain.
- R-29 PASS: netral putih/abu/gelap dan aksen ungu, status error/sukses memakai token yang sudah ada.
- R-30 PASS: tidak menyalin produk lain; memperluas gaya dashboard Awan Event yang disetujui.
- R-31 PASS: keputusan utama dan batas implementasi dicatat bersama bukti QA.

# Perubahan role langsung dari admin, 16 Oktober 2026

Permintaan: perubahan role pengguna terdaftar dilakukan dari admin tanpa undangan email. Mode antislop during yang sudah aktif tetap berlaku. Reading this as: pengelolaan akses untuk Super admin, memakai UI operasional Awan Event yang ada, ENERGY 1 / RHYTHM 1 / MOTION 1.

## Perubahan dan bukti

- Halaman Akun & peran memberi select native berlabel akun dan tombol Simpan per baris. Pilihan tidak langsung mengirim perubahan; tombol hanya aktif ketika role berubah. Setelah simpan, baris memakai respons server dan status menyebut akun serta role hasil.
- Akun sendiri ditampilkan sebagai Akun Anda, tanpa select/tombol. Undangan tetap menjadi tindakan sekunder khusus akun baru, terpisah dari perubahan role akun terdaftar.
- PATCH /api/admin/users memeriksa same-origin dan currentUser dari server, requireAdmin superOnly, limit 20 per menit, UUID serta enum role yang strict. Tidak menerima email/password/app_metadata bebas. Self-change ditolak. Target dibaca melalui Admin API dan metadata lain dipertahankan saat mengubah role. No-op tidak menulis. Akun hilang 404, error provider tidak dianggap sukses.
- GET tetap khusus Super admin, no-store, hanya mengembalikan ringkasan akun dan ID admin saat ini. Pagination 50 akun menggantikan batas lama 100 akun pertama. Halaman lanjut dihitung dari jumlah total, tidak bergantung pada nextPage SDK. Request daftar yang kedaluwarsa diabaikan lewat loadVersion.
- Existing auth/middleware memeriksa user via getUser; platform snapshot mengambil role dari app_metadata. Role pada user_metadata tidak dipercaya. Pengujian tidak mengubah role akun produksi, mengirim email, atau mengganti kredensial.
- Build produksi lulus lint, tipe dan prerender. Suite 54/54 lulus, termasuk enam tes API baru: grant/demote semua role, metadata provider tetap, tanpa undangan, actor non-super/anon/forged ditolak, origin salah, input tidak sah, self-change, akun hilang, rate-limit, idempotensi, kegagalan provider serta pagination halaman 17 dan minimisasi data respons.
- Browser komponen asli dengan transport lokal: select Peserta ke Admin operasional, Simpan via Enter, pesan sukses, muat ulang mempertahankan nilai, next/previous halaman, buka/tutup undangan opsional. Mode error: PATCH gagal dengan alert dan retry berhasil; GET gagal dan muat ulang berhasil; kosong menampilkan empty state; akses 403 tidak menampilkan kontrol role. Fixture favicon sempat mereset mode uji, diperbaiki di server fixture saja sebelum kasus error diulang dengan hasil sesuai.
- Lima viewport 360/390/768/1024/1440 tanpa overflow halaman. Tabel memiliki scroll internal pada layar sempit. Pada 390px, Tab memfokuskan tombol Simpan dengan outline solid, tinggi 63px dan berada dalam viewport; Enter berhasil menyimpan role ke Peserta. Console pengujian sukses terakhir kosong.
- Bukti: tmp/direct-roles-success.png, tmp/direct-roles-390.png, tmp/direct-roles-qa.json. Semua akun fixture memakai domain .invalid. Status sukses #087a55 pada #ecfdf5 memiliki kontras 5,08:1 menurut contrast-check.py.
- Warna, font, spacing, select, tabel dan panel memakai komponen admin yang sudah ada untuk kesinambungan. Tidak menambah ilustrasi, badge dekoratif, glow, shadow, animasi, dependency atau migrasi.

## Delivery Gate

Lingkup gate: perubahan akun/role ini, bukan audit seluruh aplikasi.

- R-02 PASS: copy baru tidak memakai em dash.
- R-03 PASS: lima viewport tanpa overflow halaman; tabel scroll internal.
- R-17 PASS: jumlah/halaman mengikuti respons server; tidak menambah statistik.
- R-18 PASS: tidak menambah testimoni atau identitas rekaan pada produk.
- R-23 PASS: tidak membuat aset visual; akun fixture ditandai pengujian dan domain .invalid.
- R-24 PASS: navigasi sebelumnya dipertahankan; pagination next/previous diuji.
- R-25 PASS: status sukses 5,08:1, kontrol dan teks memakai token admin yang ada.
- R-26 PASS: select, Simpan, reload, next/previous dan buka/tutup undangan semuanya memiliki perilaku teruji.
- R-27 PASS: loading, load-error/retry, save-error/retry, empty, unauthorized dan success tersedia dan diuji.
- R-28 PASS: FAQ tidak diubah.
- R-32 PASS: select native, label akun, Tab/Enter diuji, outline solid dan tap target 63px.
- R-33 PASS: perubahan ditulis langsung melalui patch sumber.
- R-34 PASS: mempertahankan tema admin yang ada, tanpa toggle baru.
- R-35 PASS: build dan 54 tes lulus; click-through browser tercatat di atas; console sukses kosong.
- R-36 PASS: tidak menambah klaim keamanan/promosi; pengaman dijelaskan sesuai pengujian.
- R-37 PASS: arah UI operasional yang ada dipertahankan, dials 1/1/1.
- R-38 PASS: daftar produk berasal dari Auth; fixture tidak menjadi data produksi.
- R-01 PASS: tidak menambah gradient atau glow.
- R-04 PASS: tidak menambah ikon.
- R-06 PASS: tipografi admin sebelumnya dipakai untuk konsistensi.
- R-07 PASS: tidak menambah background pattern.
- R-08 PASS: tidak menambah panah pada tombol.
- R-09 PASS: tidak menambah badge dekoratif.
- R-10 PASS: tidak menambah blur/glass.
- R-12 PASS: tidak menambah shadow.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: tabel mengikuti pekerjaan memilih akun/role, tanpa kartu fitur.
- R-19 PASS: tidak menambah animasi, sesuai MOTION 1.
- R-22 PASS: tidak menambah ilustrasi.
- Liveliness dials PASS: ENERGY 1 / RHYTHM 1 / MOTION 1 sesuai halaman operasional.
- Liveliness consistency PASS: komponen admin yang ada tetap menjadi acuan.
- Liveliness focus PASS: daftar akun dan role menjadi fokus kerja.
- Liveliness whitespace PASS: panel dan kelompok aksi mengikuti jarak admin yang ada.
- Liveliness accent PASS: ungu untuk identitas, warna semantik hanya untuk hasil simpan/error.
- Liveliness motif PASS: font/palet Awan Event tetap dipertahankan.
- Liveliness Design Read PASS: arah administratif yang sudah disetujui dipakai.
- C-1 PASS: alasan layout, warna, kontrol dan perilaku tertulis.
- C-2 PASS: seluruh kontrol baru diuji; state disabled menjaga permintaan ganda.
- C-3 PASS: daftar akun dan pagination langsung mendukung pengubahan role.
- C-4 PASS: error/empty/pagination/keyboard/lima viewport diuji.
- C-5 PASS: tidak menambah statistik atau klaim rekaan.
- R-05 PASS: tabel berbasis kebutuhan pengelolaan akun yang sudah ada.
- R-11 PASS: bentuk kontrol/panel mengikuti komponen admin.
- R-15 PASS: Simpan, Muat ulang akun, Sebelumnya/Berikutnya menyebut tindakan nyata.
- R-16 PASS: copy operasional tanpa buzzword.
- R-20 PASS: identitas admin Awan Event tetap.
- R-21 PASS: tidak mengubah tema atau menambah dark mode.
- R-29 PASS: palet merek dan warna status yang ada dipertahankan.
- R-30 PASS: tidak meniru produk lain.
- R-31 PASS: keputusan utama diberi alasan pada bagian bukti.

UI skill checklist PASS dalam lingkup ini, berdasarkan gate dan bukti di atas.

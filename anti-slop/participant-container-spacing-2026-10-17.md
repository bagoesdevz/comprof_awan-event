# Jarak container peserta

Status: PASS. Design Read: memperluas jarak container admin yang disetujui pengguna ke seluruh ruang peserta. ENERGY 1 / RHYTHM 1 / MOTION 1, tema terang Awan Event.

Aturan margin pada dashboard-workspace kini dipakai kedua area: 24px desktop, 16px tablet 768..1023px, 8px ponsel. Sudut container dan header ponsel 20px mempertahankan bingkai yang rapi. Penggabungan aturan menghindari perbedaan jarak admin/peserta saat breakpoint berubah. Warna, tipografi, kartu, data dan interaksi tetap memakai source yang ada; source perubahan hanya app/workspace-theme.css.

Build produksi lulus kompilasi, lint, tipe dan prerender 49 halaman. Edge headless menjalankan komponen shell/dashboard/profil/event/sertifikat asli, CSS build, serta Auth/router/state fixture lokal berlabel. Sebanyak 25 kombinasi dashboard, aktivitas event, profil, sertifikat peserta dan ringkasan admin pada lebar 360/390/768/1024/1440 lulus: margin sama di empat sisi, container berada di viewport, tanpa overflow, radius ponsel sesuai. Screenshot desktop dan ponsel diperiksa visual.

Sidebar kecil, tujuh tautan konten peserta, keadaan dashboard kosong, menu layar pendek dan Escape dengan fokus kembali, draft profil dan fokus solid 2px, reflow720, reduced-motion dan forced-colors lulus. Console/page errors kosong. Tidak mengubah akun/data produksi atau mengirim email. Seluruh 91 tes telah lulus pada perubahan admin sebelumnya dalam sesi ini; perubahan CSS ini diverifikasi dengan build dan browser tanpa mengulang tes backend.

Bukti lokal: tmp/participant-spacing-build.log, tmp/participant-spacing-qa.json, tmp/participant-spacing-browser.log, tmp/participant-spacing-390.png, tmp/participant-spacing-1440.png dan tmp/participant-spacing-collapsed-1440.png. Data tangkapan hanya fixture lokal. Audit dasar warna dan komponen terkait tercatat pada self-profile-2026-10-17.md serta admin-overview-spacing-2026-10-17.md.

## Delivery Gate

- R-02 PASS: tidak menambah teks UI atau em dash.
- R-03 PASS: 25 kombinasi tanpa overflow, seluruh margin dan reflow720 diperiksa.
- R-17 PASS: tidak menambah statistik atau mengubah sumber angka.
- R-18 PASS: tidak menambah testimonial atau identitas rekaan.
- R-23 PASS: tidak menambah aset atau navigasi, fixture hanya untuk QA lokal.
- R-24 PASS: tujuh tautan konten peserta mempertahankan tujuan yang benar.
- R-25 PASS: hanya margin/radius berubah; pasangan warna tetap seperti audit sebelumnya.
- R-26 PASS: tautan, menu dan input profil tetap berfungsi pada container baru.
- R-27 PASS: dashboard kosong diperiksa, loading/error provider existing tidak diubah.
- R-28 PASS: tidak mengubah FAQ.
- R-32 PASS: fokus2px, keyboard dan Escape/fokus kembali diperiksa.
- R-33 PASS: perubahan CSS langsung melalui apply_patch; helper hanya QA.
- R-34 PASS: tema terang, reduced-motion dan forced-colors dipertahankan dan diperiksa.
- R-35 PASS: build produksi dan pengujian browser relevan lulus, screenshot diperiksa.
- R-36 PASS: tidak mengklaim pengujian akun atau data produksi.
- R-37 PASS: arah pengguna jelas dan dials1/1/1 dicatat sebelum penyerahan.
- R-38 PASS: tidak menambahkan konten fixture ke produk.
- R-01 PASS: tidak menambah gradient/glow.
- R-04 PASS: tidak menambah atau mengganti ikon.
- R-06 PASS: Inter dan skala teks dashboard existing dipertahankan.
- R-07 PASS: tidak menambah pola latar.
- R-08 PASS: tidak menambah panah tombol.
- R-09 PASS: tidak menambah badge.
- R-10 PASS: tidak menambah glass/blur.
- R-12 PASS: tidak mengubah atau menambah bayangan.
- R-13 PASS: tidak ada glow baru.
- R-14 PASS: tidak mengubah susunan/ukuran relatif kartu, hanya bingkai area konten.
- R-19 PASS: tidak menambah motion, reduced-motion diperiksa.
- R-22 PASS: tidak menambah ilustrasi.
- Liveliness dials PASS: ENERGY/RHYTHM/MOTION1/1/1 konsisten dengan ruang aktivitas.
- Liveliness focus PASS: tindakan utama peserta tetap pada konten existing.
- Liveliness spacing PASS: jarak empat sisi eksplisit dengan tiga skala viewport.
- Liveliness accent PASS: aksen ungu existing tetap pada aksi/fokus/navigasi.
- Liveliness identity PASS: bingkai admin/peserta konsisten dengan identitas Awan Event.
- Liveliness Design Read PASS: arah dan ukuran disampaikan sebelum verifikasi.
- C-1 PASS: margin bersama dan radius header dijelaskan menurut fungsinya.
- C-2 PASS: navigasi, menu dan field tetap bekerja pada layout baru.
- C-3 PASS: tidak menambah bagian halaman untuk mengisi ruang.
- C-4 PASS: lima halaman/lima lebar, empty, collapse, drawer dan aksesibilitas diperiksa.
- C-5 PASS: tidak membuat angka atau klaim baru.
- R-05 PASS: komposisi existing tetap, hanya ruang tepi sesuai permintaan.
- R-11 PASS: radius container/header20px mengikuti bingkai ponsel; komponen lain tetap bervariasi.
- R-15 PASS: label CTA existing tidak berubah.
- R-16 PASS: tidak menambah copy atau buzzword.
- R-20 PASS: tema dan konten Awan Event dipertahankan.
- R-21 PASS: tema terang sesuai pilihan pengguna.
- R-29 PASS: tidak menambah warna baru.
- R-30 PASS: konsistensi dengan area admin aplikasi sendiri.
- R-31 PASS: keputusan dan bukti perubahan dicatat di atas.

# Input jadwal admin, 15 Oktober 2026

Permintaan: input tanggal dan waktu pendaftaran dibuka, pelaksanaan dimulai dan selesai.

Editor Buat/Edit event pada langkah Jadwal & akses kini memisahkan Jadwal pendaftaran dan Jadwal pelaksanaan. Setiap paket tiket memiliki input pembukaan dan penutupan pendaftaran. Pelaksanaan memiliki input mulai dan selesai. Seluruh label menyebut WIB, memakai konversi WIB ke UTC yang sudah tersedia, dan terhubung ke state penyimpanan asli. Input pada langkah Tiket & pendaftaran tetap memakai state tiket yang sama. Tidak ada perubahan schema atau migrasi.

Pembukaan kosong berarti langsung setelah publikasi; penutupan kosong mengikuti akhir pelaksanaan. Akhir pelaksanaan kosong tetap memakai perilaku lama mulai ditambah satu jam. Bantuan di bawah input menjelaskan ketiganya. Waktu selesai <= mulai dan waktu penutupan <= pembukaan ditolak sebelum menyimpan.

## Arah dan alasan

Reading this as: editor operasional Awan Event untuk admin, mengikuti identitas dan komponen aplikasi yang ada, ENERGY 1 / RHYTHM 1 / MOTION 1.

- Dua kelompok jadwal membedakan akses pendaftaran dan waktu acara.
- Jadwal per paket memakai model tiket yang sudah berlaku tanpa menambah sumber data kedua.
- Warna, font, radius dan fokus mengikuti token aplikasi agar konsisten dengan editor lain.
- Grid satu kolom pada ponsel dan dua kolom pada layar lebih lebar memberi ruang untuk tanggal dan jam.
- Border dan jarak antarkelompok membantu pemindaian; tidak menambah kartu, ikon atau dekorasi.

## Bukti pengujian

- npm run build lulus, termasuk lint dan typecheck, 49 halaman statis dihasilkan.
- Browser fixture memakai EventWizard/AdminShell asli dan stylesheet build; seluruh perubahan data hanya dalam memori fixture berlabel jelas.
- Simpan: buka 1 Oktober 2030 08.00 WIB menjadi 2030-10-01T01:00:00.000Z; tutup 17 Oktober 22.00 WIB menjadi 2030-10-17T15:00:00.000Z; mulai 16 Oktober 09.00 WIB menjadi 2030-10-16T02:00:00.000Z; selesai 12.00 WIB menjadi 2030-10-16T05:00:00.000Z. Hasil dibaca dari keluaran tersimpan yang terlihat di halaman.
- Dua urutan tanggal tidak valid memunculkan pesan yang sesuai dan tidak mengubah data tersimpan; pemulihan ke jadwal valid berhasil disimpan.
- Lebar 360/390/768/1024/1440 tanpa horizontal overflow; keempat native datetime-local terlihat lengkap. Save lewat Enter teruji.
- Enam pasangan teks baru memiliki rasio kontras 16.66, 5.79, 4.83, 4.83, 16.66 dan 4.83, memenuhi 4.5:1.
- Screenshot lokal tmp/event-date-inputs-1440.png menampilkan input dan pesan sukses. Crop memusatkan editor, sementara logo yang tidak disediakan server fixture berada di luar crop; source logo aplikasi tidak diubah.
- git diff --check lulus. Server/tab fixture dihentikan sesudah QA.

## Delivery Gate, lingkup perubahan input jadwal

- R-02 PASS: copy baru tanpa em dash.
- R-03 PASS: lima viewport tidak overflow.
- R-17 PASS: tidak menambah statistik pemasaran.
- R-18 PASS: tidak menambah testimonial.
- R-23 PASS: tidak membuat aset atau navigasi baru.
- R-24 PASS: navigasi aplikasi tidak diubah.
- R-25 PASS: keenam pasangan teks baru >=4.5:1.
- R-26 PASS: keempat input dan simpan bekerja pada pengujian browser.
- R-27 PASS: pesan validasi dan sukses teruji; keadaan tanpa paket dijelaskan.
- R-28 PASS: FAQ tidak diubah.
- R-32 PASS: label native dan simpan lewat Enter teruji; gaya fokus aplikasi dipertahankan.
- R-33 PASS: perubahan source memakai apply_patch.
- R-34 PASS: tidak mengubah tema atau toggle.
- R-35 PASS: build final dan pengujian interaksi input/simpan selesai.
- R-36 PASS: laporan membedakan fixture lokal dan produksi yang belum diverifikasi.
- R-37 PASS: arah operasional dan dials dinyatakan.
- R-38 PASS: jadwal fiktif hanya pada fixture pengujian berlabel.
- R-01 PASS: tidak menambah gradient.
- R-04 PASS: tidak menambah ikon; picker kalender native menunjukkan fungsi tanggal.
- R-06 PASS: tipografi aplikasi dipertahankan agar label konsisten.
- R-07 PASS: tidak menambah pola latar.
- R-08 PASS: tidak menambah panah dekoratif.
- R-09 PASS: tidak menambah badge.
- R-10 PASS: tidak menambah glassmorphism.
- R-12 PASS: tidak menambah shadow.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: kelompok input mengikuti dua jenis jadwal, tanpa kartu fitur.
- R-19 PASS: tidak menambah animasi.
- R-22 PASS: tidak menambah ilustrasi.
- Liveliness PASS: dials 1/1/1; judul langkah menjadi fokus, whitespace memisahkan jadwal, aksen langkah aktif dan motif label mengikuti editor.
- C-1 PASS: alasan kelompok, grid dan label WIB dicatat di atas.
- C-2 PASS: nilai input tersimpan dan kedua validasi menolak data tidak valid.
- C-3 PASS: setiap input menjawab kebutuhan jadwal admin.
- C-4 PASS: lima viewport, keyboard, validasi dan pemulihan sukses diuji.
- C-5 PASS: tidak mengklaim penyimpanan atau deployment produksi.
- R-05 PASS: struktur wizard yang ada dipertahankan.
- R-11 PASS: radius input mengikuti aplikasi.
- R-15 PASS: aksi tetap Simpan draft dan label waktu eksplisit.
- R-16 PASS: bantuan menjelaskan efek input kosong dengan bahasa langsung.
- R-20 PASS: identitas Awan Event dipertahankan.
- R-21 PASS: tema admin yang ada dipertahankan dalam perubahan terbatas ini.
- R-29 PASS: memakai token brand dan netral yang ada.
- R-30 PASS: tidak meniru produk lain.
- R-31 PASS: alasan keputusan visual tercatat di atas.

## Status

Pengguna mengizinkan commit dan push ke origin/main pada 15 Oktober 2026, serta meminta push otomatis untuk perubahan berikutnya setelah pekerjaan dan pemeriksaan selesai. Deployment belum diverifikasi. Tidak ada perubahan data produksi. Penyimpanan browser diuji lewat provider fixture dalam memori, bukan sesi admin produksi.

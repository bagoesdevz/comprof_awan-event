# Verifikasi nama sertifikat, 16 Oktober 2026

Permintaan: setelah evaluasi kegiatan, peserta memeriksa/memperbaiki nama yang terbit di sertifikat, mengonfirmasinya, lalu memperoleh tombol unduh. Reading this as: langkah penyelesaian kegiatan untuk peserta, memakai formulir operasional Awan Event, ENERGY 1 / RHYTHM 1 / MOTION 1. Mode antislop during tetap berlaku.

## Perubahan dan bukti

- Feedback disimpan lebih dulu tanpa menerbitkan sertifikat. Halaman feedback selesai dan daftar sertifikat memakai CertificatePanel yang sama untuk langkah verifikasi nama.
- Field Nama pada sertifikat diisi dari nama pendaftaran. Mengubah nama menghapus centang konfirmasi; tombol baru aktif setelah nama valid dan checkbox dicentang. Setelah disimpan, form diganti status terverifikasi dan tombol unduh jika sertifikat siap. Teks menjelaskan bahwa nama hanya untuk sertifikat event ini dan dikunci setelah konfirmasi.
- Action confirm-certificate-name memeriksa autentikasi, kepemilikan pendaftaran, pembayaran, aktivitas termasuk evaluasi, event terbit/selesai, fitur sertifikat, pengakuan confirmed:true, nama 2..160 karakter dan penolakan karakter kontrol. Generic PATCH tidak bisa menulis registrations. Konfirmasi disimpan atomik dengan revision lewat commit yang ada; retry nama sama idempoten dan nama berbeda ditolak setelah konfirmasi. Sertifikat dicabut tidak dapat dipulihkan melalui alur ini.
- certificateName menyimpan nama serta waktu konfirmasi, terpisah dari registration.name dan profil. Snapshot certificate.recipientName dipakai oleh SVG unduhan, verifikasi publik dan email. Sertifikat lama tetap memakai token/nomor serta metadata yang sama setelah konfirmasi pertama.
- Unduhan memeriksa nama, eligibility, kepemilikan/status, token dan state terbaru sebelum mengembalikan file; nama XML di-escape. Client fetch file hanya setelah tombol ditekan, menampilkan pesan error serta mempertahankan retry ketika template/koneksi gagal.
- issueCertificate dan issueEligible tidak menerbitkan sertifikat sebelum konfirmasi. Cron memeriksa nama, dan SQL RPC memfilter konfirmasi sebelum LIMIT sehingga peserta belum verifikasi tidak menghambat antrean lain. Template yang belum tersedia menghasilkan status disiapkan, bukan tombol unduh palsu.
- Migrasi 202610160001 diterapkan melalui Supabase CLI pada proyek tertaut yang sudah diverifikasi, dicatat applied secara spesifik. Postflight membuktikan fungsi memiliki filter certificateName, privilege anon/authenticated tetap false dan service_role true, serta jumlah pendaftaran/sertifikat dan konfirmasi nama tidak berubah. Tidak ada backfill atau mutasi peserta/sertifikat produksi, tidak ada cron/email yang dipicu manual.
- Build produksi lulus lint, tipe dan prerender. Suite 62/62 lulus, termasuk alur feedback ke konfirmasi, metadata/nama pendaftaran tetap, pemilik/requirements, input invalid dan forged payload, retry/immutability, konflik commit, legacy token/nomor, template pending, SVG/XML, verifikasi publik, bypass unduhan dan fresh-state guards. PGlite membuktikan 55 peserta belum konfirmasi tidak menghalangi kandidat terverifikasi dan hak RPC tetap tertutup bagi anon/authenticated.
- Browser memakai komponen dan handler action/download asli dengan penyimpanan lokal dan user fixture. Empat nilai evaluasi dikirim, nama diubah ke Nama Peserta, S.Kep., Ns., checkbox dikonfirmasi, tombol unduh tampil, file SVG berhasil diunduh. Isi file diperiksa dan memuat nama yang dikonfirmasi serta nomor sertifikat.
- Browser membuktikan tombol unduh 0 sebelum konfirmasi, tombol konfirmasi disabled sebelum centang, edit nama mereset centang, legacy mempertahankan AWN-LEGACY, revoked tidak menyediakan form/unduh aktif, error konfirmasi lalu retry, template pending tanpa tombol unduh dan reload, serta error unduh dengan tombol retry aktif.
- Dua mode normal/panjang pada lima viewport 360/390/768/1024/1440 tanpa overflow. Tab pada 390px mencapai tombol Konfirmasi nama dengan outline solid dan tinggi 46px. Bukti tmp/certificate-name-form.png, tmp/certificate-name-ready.png, tmp/certificate-name-390.png, tmp/certificate-name-qa.json. File SVG lokal hasil pengujian tidak menjadi sertifikat produksi.
- Warna/font/panel/field/focus memakai sistem peserta yang ada. Tidak menambah aset visual, animasi, dekorasi, dependency atau perubahan format unduhan; format SVG dipertahankan.

## Delivery Gate

Lingkup gate: fitur verifikasi nama/sertifikat ini, bukan sertifikasi seluruh aplikasi.

- R-02 PASS: copy baru tidak memakai em dash.
- R-03 PASS: sepuluh pemeriksaan lima viewport tanpa overflow.
- R-17 PASS: status, nama dan nomor mengikuti respons handler; fixture diberi label pengujian.
- R-18 PASS: tidak menambah testimoni atau identitas rekaan pada produk.
- R-23 PASS: tidak membuat aset visual; seluruh data uji hanya lokal.
- R-24 PASS: link kembali ke event, aktivitas dan verifikasi memakai rute yang ada.
- R-25 PASS: memakai token teks gelap/putih serta error/focus dari sistem peserta yang sudah ada; teks tidak menimpa foto atau gradient.
- R-26 PASS: submit evaluasi, input, checkbox, konfirmasi, unduh, retry dan reload memiliki perilaku teruji.
- R-27 PASS: pending, gagal/retry, template belum siap, dicabut dan nama terverifikasi tersedia dan diuji.
- R-28 PASS: FAQ tidak diubah.
- R-32 PASS: native input/checkbox dan label, Tab/Enter, outline solid, tombol 46px pada ponsel.
- R-33 PASS: perubahan ditulis langsung melalui patch sumber.
- R-34 PASS: tema peserta yang ada dipertahankan, tanpa toggle baru.
- R-35 PASS: build, 62 tes dan browser click-through lulus; SVG hasil unduh diperiksa.
- R-36 PASS: tidak menambah klaim keamanan/identitas tersertifikasi; verifikasi ini adalah konfirmasi nama oleh peserta.
- R-37 PASS: mengikuti arah UI peserta Awan Event dan dials 1/1/1.
- R-38 PASS: nama aktual berasal dari peserta sendiri; tidak ditulis sebagai data nyata di fixture produksi.
- R-01 PASS: tanpa gradient atau glow baru.
- R-04 PASS: ikon sertifikat/status sebelumnya dipertahankan sesuai fungsi, tidak menambah ikon dekoratif.
- R-06 PASS: font/ukuran teks mengikuti sistem peserta.
- R-07 PASS: tidak menambah pattern background.
- R-08 PASS: tidak menambah panah tombol.
- R-09 PASS: badge hanya menyampaikan status sertifikat yang sebenarnya.
- R-10 PASS: tidak menambah glass/blur.
- R-12 PASS: tidak menambah shadow.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: satu form untuk pekerjaan konfirmasi nama, bukan kartu fitur berulang.
- R-19 PASS: tidak menambah animasi, sesuai MOTION 1.
- R-22 PASS: tidak menambah ilustrasi.
- Liveliness dials PASS: ENERGY 1 / RHYTHM 1 / MOTION 1 sesuai pekerjaan konfirmasi.
- Liveliness consistency PASS: memakai panel/field/button peserta yang sudah ada.
- Liveliness focus PASS: nama yang akan dicetak menjadi fokus form.
- Liveliness whitespace PASS: nama, penjelasan, pengakuan dan tindakan dikelompokkan dengan jarak form.
- Liveliness accent PASS: warna merek pada tindakan utama, informasi lain lebih tenang.
- Liveliness motif PASS: tipografi dan bentuk komponen Awan Event konsisten.
- Liveliness Design Read PASS: arah operasional peserta tercatat pada awal laporan.
- C-1 PASS: alasan data terpisah, layout, kontrol dan state dijelaskan di atas.
- C-2 PASS: tidak ada tombol palsu; unduhan menghasilkan file yang diperiksa.
- C-3 PASS: langkah baru langsung diperlukan sebelum penerbitan/unduhan sesuai permintaan.
- C-4 PASS: normal/panjang, legacy, revoked, pending, gagal/retry dan keyboard diuji.
- C-5 PASS: tidak mengarang data peserta/sertifikat produksi.
- R-05 PASS: alur evaluasi ke konfirmasi ke unduh mengikuti pekerjaan peserta.
- R-11 PASS: radius mengikuti field/panel/button yang ada.
- R-15 PASS: Konfirmasi nama, Unduh sertifikat, Muat ulang sertifikat menyebut tindakan konkret.
- R-16 PASS: tanpa buzzword atau copy promosi.
- R-20 PASS: identitas peserta Awan Event tetap.
- R-21 PASS: tidak mengubah tema.
- R-29 PASS: palet merek dan warna status yang ada dipertahankan.
- R-30 PASS: tidak meniru produk lain.
- R-31 PASS: keputusan utama memiliki alasan tertulis.

UI skill checklist PASS dalam lingkup fitur ini, didukung bukti di atas.

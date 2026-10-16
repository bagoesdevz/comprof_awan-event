# Hapus event khusus Super admin, 16 Oktober 2026

Permintaan: fitur hapus event yang hanya dapat diakses Super admin. Arah mengikuti daftar event operasional Awan Event, ENERGY 1 / RHYTHM 1 / MOTION 1. Nama kegiatan dan keputusan Hapus menjadi fokus dialog, dengan tindakan Batal lebih dulu.

## Implementasi

- Daftar event menyediakan Hapus, konfirmasi bernama event, Event aktif/Sampah serta Pulihkan sebagai draf hanya untuk session.role super. Dialog memakai Radix, fokus awal Batal, perangkap fokus, Escape/Batal, error dan retry, kontrol disabled saat menyimpan dan fokus kembali ke pencarian.
- Server action delete-event/restore-event memanggil requireAdmin(user,true), memeriksa app_metadata dari user terautentikasi, payload strict, id dan confirmed:true. API POST tetap memakai autentikasi, same-origin, rate limit dan snapshot yang ada. UI bukan batas otorisasi.
- Hapus bersifat dapat dipulihkan: record tetap ada dengan deletedAt/deletedBy, publication draft, registrationStatus CLOSED dan published false. Restore menghapus penanda, mempertahankan ID/slug/kode/cover dan tetap draf dengan pendaftaran tertutup. Tidak menghapus record peserta, storage, transaksi atau sertifikat; tidak ada hapus permanen atau migrasi SQL.
- Event yang memiliki pendaftaran, termasuk riwayat status pembayaran, tidak dapat dihapus. Pemeriksaan server membaca satu ID pendaftaran; commit revision event yang sama melindungi race dengan pendaftaran baru atau perubahan admin. UI menjelaskan penggunaan Jadikan draf sebagai alternatif.
- Snapshot memisahkan eventTrash dari events; isi Sampah hanya untuk Super admin, metadata revision Sampah tidak dikirim. Publik/operasional tidak menerima daftar Sampah. findEvent/findPublicEvent menolak record bertanda hapus. PATCH umum menolak penanda maupun edit record Sampah, sehingga pemulihan tidak dapat dilewati oleh admin operasional. Pembuat kode publik melewati record Sampah. Broadcast konten memakai mekanisme yang sudah ada.

## Bukti

- Suite 72/72 lulus. Enam tes baru menguji role termasuk pemalsuan user_metadata.role, delete/restore/idempotensi, identitas tetap, peserta dan konflik commit, konfirmasi/input strict/404, bypass PATCH, pemisahan snapshot dan penolakan link.
- Build final mencakup lint, tipe dan prerender. Tidak menambah dependency.
- Browser bawaan gagal memulai karena kernel assets tidak ditemukan; pengujian aplikasi lokal dilakukan melalui skrip Playwright headless di fixture. Komponen daftar event, PlatformProvider, runAction/changeEventTrash, guard dan validasi asli dipakai dengan penyimpanan lokal; tidak menghapus event produksi.
- Admin operasional tidak memiliki tombol Hapus/Sampah. Super admin: Escape menutup tanpa perubahan, Batal fokus pertama, simpan gagal mempertahankan dialog/event, retry masuk Sampah, pemulihan kembali sebagai draf, Sampah kosong teruji, event dengan pendaftaran tidak memiliki tombol konfirmasi hapus.
- Lima viewport aktual 360/390/768/1024/1440 tanpa overflow dokumen/dialog dan dialog berada dalam layar. Tab tetap di dalam dialog; setelah Escape fokus kembali ke Cari event. Page errors kosong. Bukti tmp/event-trash-qa.json, tmp/event-trash-modal.png, tmp/event-trash-restored.png, tmp/event-trash-390.png.

## Delivery Gate

PASS dalam lingkup fitur ini. Hard Gate R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38: copy ringkas tanpa em dash, layar/keyboard diuji, data fixture berlabel, tidak menciptakan orang/angka/aset produk, rute existing dipakai, kontrol/status gagal/retry/empty/protected diuji, dialog accessible dengan Title/Description/fokus, source dipatch langsung dan tema/otorisasi tidak dilonggarkan.

Purpose Gate R-01/04/06/07/08/09/10/12/13/14/19/22 PASS: font, bentuk panel, tombol dan overlay memakai sistem admin yang ada; ikon Trash2 menjelaskan Hapus; badge menyampaikan status record; tidak ada dekorasi/gradient/aset/animasi baru. Dials/liveliness PASS: satu keputusan per dialog, pemisahan judul/penjelasan/tindakan, aksen merek pada konfirmasi dan ruang mengikuti formulir admin.

Craftsmanship C-1..5 dan R-05/11/15/16/20/21/29/30/31 PASS: tujuan konfirmasi/pemulihan dan perlindungan pendaftaran tercatat, tindakan spesifik dan dapat dipakai, keadaan gagal/protected/empty serta ponsel diuji, tidak mengubah desain halaman publik. Gate ini bukan audit ulang seluruh aplikasi.

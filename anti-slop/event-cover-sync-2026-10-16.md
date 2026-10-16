# Cover kartu event dan sinkronisasi, 16 Oktober 2026

Permintaan pengguna: memperjelas lokasi penggantian cover kartu event di beranda dan mempercepat perubahan setelah simpan. Arah: editor operasional Awan Event yang sudah ada, ENERGY 1 / RHYTHM 1 / MOTION 1; tidak mendesain ulang kartu publik.

## Perubahan

- Satu input Cover kartu event pada Event > Edit > Landing page, dengan pratinjau, hapus, indikator unggah dan petunjuk simpan. Gambar bagian Pembuka dihapus karena hero detail event hanya teks. CMS Pembuka memakai label Gambar pembuka beranda dan tautan petunjuk ke pengaturan event.
- eventVisual memakai banner sebagai sumber cover utama. Gambar Hero lama tetap cadangan jika banner kosong. Saat editor memuat data lama, gambar cadangan diangkat ke field cover; saat disimpan, image Hero dikosongkan agar Hapus cover tidak memunculkan gambar lama kembali. Bagian gambar non-Hero tetap memiliki sumbernya sendiri.
- Commit konten events/cms/articles mengirim broadcast invalidasi kosong melalui Supabase sesudah transaksi berhasil. Tidak mengirim record, identitas, kredensial meeting, draft atau snapshot. Hak akses API dan tabel tetap seperti sebelumnya, tanpa migrasi atau membuka akses database.
- Provider publik menerima sinyal, menggabungkan notifikasi dalam 200 ms, lalu membaca snapshot no-store dengan filter server yang sama. BroadcastChannel mempercepat tab pada browser yang sama. Reconnect, online, visibility dan interval cadangan 15 detik mengambil perubahan yang terlewat; tab tersembunyi/offline tidak melakukan pembacaan latar. Payload notifikasi tidak dipercaya sebagai state. Gagal sinkronisasi latar tidak menghapus konten yang sudah dimuat atau menampilkan kegagalan simpan palsu.
- Editor event mempertahankan versi yang dimuat selama pengetikan; simpan tetap memperbarui state langsung dan mengirim sinyal ke halaman publik. CMS mempertahankan tulisan belum disimpan. Jika versi CMS berubah dari editor lain, save diblokir dan admin dapat menyalin tulisannya sebelum memilih Muat versi terbaru.

## Verifikasi

- Suite 66/66 lulus termasuk empat tes baru: prioritas cover/legacy/gambar bagian, hanya commit sukses yang menyiarkan sinyal kosong, kegagalan sinyal tidak menggagalkan simpan, debounce/reconnect/visibility/offline/fallback/cleanup serta penolakan payload tab yang bukan sinyal.
- Build produksi akhir memeriksa lint, tipe dan prerender. Browser memakai komponen asli EventWizard, CMS, FeaturedPrograms, PlatformProvider serta listener sinkronisasi dengan transport lokal, schema validasi asli dan penyimpanan fixture. Tidak menyimpan event/CMS produksi atau mengunggah foto ke storage produksi.
- Browser membuktikan cover lama terbaca, unggah memberi pratinjau tanpa menerbitkan, simpan memperbarui kartu tab pengunjung tanpa reload, input gambar Hero berjumlah nol, tombol Ubah cover kembali ke satu input cover, serta Hapus cover/simpan menghasilkan fallback logo.
- Dua editor CMS membuktikan tulisan belum disimpan tetap utuh ketika editor lain menyimpan, warning muncul, tombol simpan dinonaktifkan dan Muat versi terbaru memuat hasil terbaru.
- Editor dan kartu publik diuji pada 360/390/768/1024/1440 px tanpa overflow. Pengujian awal multitab ternyata mengubah viewport hanya pada tab aktif; hasil awal 1280 px tidak digunakan. Pengukuran diulang dengan tab pengujian aktif dan width aktual sesuai lima target.
- Keyboard Tab mencapai Hapus cover dengan outline solid dan tinggi tombol 46 px. Bukti tmp/content-cover-editor.png, tmp/content-cover-390.png, tmp/content-cover-qa.json. Pengujian browser menggunakan transport notifikasi lokal; roundtrip Supabase Realtime produksi tidak dipicu secara manual.

## Delivery Gate

Gate dan UI checklist PASS untuk perubahan ini. Hard Gate R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38: ejaan sederhana, ukuran layar dan keyboard diuji, data pengujian berlabel lokal, tanpa identitas/aset/angka rekaan pada produk; kontrol unggah/hapus/simpan/konflik/reload teruji; memakai label, focus, warna dan rute admin yang ada. Tidak ada theme atau klaim keamanan baru.

Purpose Gate R-01/04/06/07/08/09/10/12/13/14/19/22 PASS: font dan komponen admin merek yang ada, pratinjau menunjukkan cover yang akan disimpan, tanpa dekorasi, badge, ikon, gerak atau aset baru. Liveliness PASS: dials 1/1/1 untuk formulir operasional; satu pekerjaan, hierarki label/petunjuk/pratinjau/tindakan dan whitespace struktural dari sistem yang ada.

Craftsmanship C-1..5 dan R-05/11/15/16/20/21/29/30/31 PASS: input tunggal menyelesaikan konflik sumber; tindakan bernama jelas, status unggah/konflik tersedia, warna/font/bentuk dan susunan halaman publik tetap. Cakupan ini tidak menyatakan seluruh aplikasi telah diaudit ulang.

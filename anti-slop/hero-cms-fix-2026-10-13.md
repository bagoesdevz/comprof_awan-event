# Sinkronisasi hero event dengan CMS

Hero event sebelumnya membaca event.title dan event.summary, sementara teks yang tersimpan pada block Hero diabaikan. eventHeroContent kini memilih judul/body block terlebih dahulu dan kembali ke informasi program ketika block memakai judul default atau body kosong. Gambar tetap memakai gambar bagian sebelum poster utama.

Editor memuat teks Hero yang sudah tersimpan ke field bersama judul/ringkasan program. Setelah penyimpanan ulang, teks itu berada pada field program dan block Hero dinormalisasi agar teks lama tidak menimpa perubahan berikutnya. Gambar block tetap dipertahankan. Alur sinkronisasi dua arah yang sudah ada tidak diganti menjadi dua editor terpisah.

Perubahan ditujukan ke hero event pada screenshot. CMS Home adalah konten beranda, bukan sumber teks untuk semua event. Data live dan sumber input pengguna belum dikonfirmasi; pengujian menggunakan fixture lokal tanpa remote writes.

## Validasi dan Delivery Gate perubahan

PASS: TypeScript dan build produksi lulus. Build menggunakan .next-hero-check sementara karena cache .next sebelumnya bermasalah di OneDrive; konfigurasi sementara dikembalikan setelah QA. Tiga peringatan img lama tetap ada.

PASS: tmp/verify-hero-cms.cjs menguji source komponen di browser terisolasi. Teks block tersimpan terbaca di editor, edit judul/ringkasan sinkron dengan informasi program, pratinjau menampilkan nilai terbaru, dan simpan/buka ulang mempertahankan perubahan. Field kosong kembali ke deskripsi program.

PASS: tmp/verify-hero-public.cjs menguji halaman event hasil build pada 1440 px dan 375 px menggunakan snapshot API fixture. Hero menampilkan judul/body/gambar block, tidak memakai placeholder ketika gambar tersedia, dan kembali ke judul/ringkasan/deskripsi/poster program ketika field khusus kosong. Tidak ada overflow horizontal atau pageerror. Screenshot mobile ditinjau.

PASS: tidak ada konten pemasaran, statistik, identitas, atau aset baru ditambahkan ke produk. Judul, ringkasan, dan gambar berasal dari input; data pada tes ditandai sebagai fixture. Bahasa bantuan editor menjelaskan fallback. Kontrol edit, pratinjau, tutup pratinjau, simpan, dan buka ulang memiliki bukti tes.

Arah visual mengikuti halaman event yang sudah ada: terang dan ungu, ENERGY 2 / RHYTHM 2 / MOTION 1 untuk bagian hero event. Perubahan memperbaiki sumber data tanpa mengganti sistem warna, tipografi, spacing, atau navigasi. Pemeriksaan ini bukan audit WCAG atau kesiapan production seluruh aplikasi, dan bukan verifikasi penyimpanan Supabase live.

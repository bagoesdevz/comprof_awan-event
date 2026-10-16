# Isian pribadi tetap saat pembaruan data, 16 Oktober 2026

Permintaan: form informasi pribadi pendaftaran menghilang/kehilangan isian setelah diisi. Penyebab: efek ProfileEditor bergantung pada seluruh state.profiles dan mengisi ulang form pada setiap snapshot, termasuk polling sinkronisasi 15 detik. Arah tetap formulir operasional peserta Awan Event, ENERGY 1 / RHYTHM 1 / MOTION 1.

## Perbaikan

- mergeProfileDraft membangun profil dari data tersimpan dan email akun, lalu mempertahankan kolom yang telah disentuh pengguna, termasuk isian sengaja dikosongkan. Kolom yang belum diedit dapat mengikuti data terbaru. Draft akun lain tidak pernah digabung, dan email tidak dapat ditimpa oleh draft.
- ProfileEditor melacak kolom yang diedit, menghidrasi sesuai identitas akun, serta mempertahankan input pada polling/fokus/pembaruan snapshot. Saat menyimpan, hanya edit lokal digabung ke profil terbaru agar kolom yang tidak diedit tidak menimpa pembaruan lain. Identitas sesi diperiksa lagi di callback update.
- Form dinonaktifkan sementara selama penyimpanan melalui fieldset, tetap tampil. Kegagalan menampilkan pesan dan mempertahankan draft untuk retry. Berpindah akun menghapus edit lokal sebelumnya; tidak menyimpan data pribadi ke localStorage/sessionStorage.
- RegistrationWizard mempertahankan tahap profil yang sedang terbuka meskipun profil menjadi lengkap dari pembaruan lain. Perpindahan ke langkah berikutnya dilakukan sesudah Simpan data & lanjutkan berhasil, melalui onComplete. Guard login, status event dan pendaftaran yang sudah ada tetap berlaku.

## Bukti

- Build produksi lulus lint, TypeScript dan prerender. Suite 75/75 lulus, termasuk tiga tes merge draft: snapshot/pengosongan sengaja, penggabungan edit ke data terbaru dan isolasi akun/email. Tidak ada dependency, migrasi atau perubahan API/database produksi.
- Browser headless memakai ProfileEditor, RegistrationWizard dan PlatformProvider asli dengan transport akun/penyimpanan lokal serta profileSchema asli. Menunggu polling interval 15 detik yang sebenarnya: seluruh sembilan kolom wajib, fokus dan posisi kursor tetap. Fokus window dan refresh manual juga mempertahankan isian.
- Form berpindah hanya setelah simpan eksplisit berhasil. Profil yang dilengkapi dari perangkat lain tidak menutup form yang sedang diedit; kolom belum disentuh mengikuti nilai baru, nama lokal tetap. Gagal simpan lalu refresh tetap menyimpan semua input; retry berhasil lanjut. Pengosongan sengaja bertahan dan perpindahan akun membersihkan data lokal sebelumnya.
- Lima viewport 360/390/768/1024/1440 tanpa overflow, semua input berada di layar. Browser page errors kosong. Bukti tmp/profile-draft-preserved.png, tmp/profile-draft-390.png, tmp/profile-draft-qa.json. Semua data berlabel pengujian; tidak mengubah profil atau pendaftaran produksi.

## Delivery Gate

Gate/UI checklist PASS dalam lingkup perbaikan state form ini. Hard Gate R-02/03/17/18/23/24/25/26/27/28/32/33/34/35/36/37/38: tidak menambah konten/aset/identitas rekaan pada produk, lima viewport dan fokus/kursor teruji, label/input native/fieldset dipakai, gagal/retry dan pergantian akun teruji, tidak menambah route atau klaim keamanan, warna/font/tema mengikuti form peserta.

Purpose Gate R-01/04/06/07/08/09/10/12/13/14/19/22 PASS: tidak menambah dekorasi, gambar, ikon, badge, efek atau animasi. Dials/liveliness PASS: fokus tetap penyelesaian data peserta, hierarki dan jarak form yang ada dipertahankan. Craftsmanship C-1..5 dan R-05/11/15/16/20/21/29/30/31 PASS: mencegah hilangnya kerja pengguna, perpindahan langkah sesuai tindakan simpan yang berhasil, status gagal jelas, keadaan perubahan jarak jauh/akun/ponsel teruji dan tidak mendesain ulang halaman.

# Konfirmasi email dan reset kata sandi, 15 Oktober 2026

Lingkup: tujuan tautan email, form kata sandi baru dan feedback. Arah mengikuti antarmuka Awan Event yang disetujui: operasional terang, aksen ungu, ENERGY 1 / RHYTHM 1 / MOTION 1. Input dan CTA menjadi fokus; jarak memisahkan instruksi, form dan hasil.

## Penyebab dan perubahan

URL yang dikirim pengguna menuju localhost. Supabase project `wgjijdkmxafnskpnjlqn` terkonfirmasi memiliki Site URL `http://localhost:3000` dan daftar redirect kosong. [Dokumentasi Supabase](https://supabase.com/docs/guides/auth/redirect-urls) menjelaskan fallback Site URL dan allowlist redirect.

CLI menerapkan tepat dua properti dari `supabase/config.toml`: Site URL menjadi `https://awanevent.com` dan allowlist callback. Diff setelah push menunjukkan update: 0. Delapan properti remote yang tidak dideklarasikan dibiarkan, termasuk konfirmasi email dan MFA. Tidak mengubah data peserta, event atau kata sandi produksi.

Provider menolak template khusus pada paket gratis dengan layanan email bawaan. Template khusus dibatalkan dan tidak masuk perubahan. Template bawaan dan PKCE tetap digunakan. Minta dan buka tautan pada browser yang sama; jika berbeda, minta tautan baru dari browser tersebut. Email lama yang menuju localhost atau kedaluwarsa perlu diganti. Tidak mengubah paket atau SMTP.

Helper memakai domain utama dengan tujuan eksplisit. Callback menerima PKCE dan token_hash yang didukung, menolak verifikasi gagal, menutup sesi lokal setelah konfirmasi dan mempertahankan sesi recovery untuk form. Redirect 303 memakai no-store/no-referrer, tanpa tujuan eksternal dari next. Error browser berbeda punya instruksi kirim ulang. Error provider pada root diarahkan ke login; root biasa tidak meminta Auth tambahan.

Form reset memverifikasi pengguna melalui Auth sebelum menampilkan input. Checking, invalid dan unavailable memiliki feedback berbeda. Sukses simpan menutup sesi lokal lalu membuka login. Update gagal mempertahankan form. Retry logout gagal hanya mengulang logout/navigasi, tanpa mengganti password lagi. Login menyediakan kirim ulang konfirmasi hanya dengan email serta pemberitahuan konfirmasi/reset berhasil.

## Verifikasi

- Suite lokal 44 tes lulus. Tujuh tes callback mencakup domain tujuan, signup/email, recovery/invite, next lama, kegagalan verifikasi/layanan/logout serta error provider di root. Setelah menambahkan kode SDK `pkce_code_verifier_not_found`, tujuh tes tersebut diulang dan lulus.
- Build produksi final lulus termasuk lint/typecheck. Build sandbox sempat gagal EPERM pada folder build; pengulangan dengan izin proses yang sesuai berhasil.
- Browser memakai AuthForm dan PasswordForm asli dengan SDK fixture berlabel. Tidak mengirim email atau mengubah akun/password nyata.
- Login menampilkan konfirmasi sukses. Kirim ulang tanpa password memakai callback signup domain utama. Forgot password memakai callback recovery domain utama.
- Reset valid menampilkan Kata sandi baru. Submit membuktikan urutan getUser, updatePassword, signOut lokal, navigasi login dan feedback sukses.
- Sesi kedaluwarsa menyediakan permintaan tautan baru. Pemeriksaan offline dapat diulang sampai form muncul. Update gagal tetap di form. Retry logout gagal tidak mengulang updatePassword.
- Login/reset pada 360/390/768/1024/1440 tanpa horizontal overflow. Submit melalui Enter teruji. Console error fixture kosong.
- Kontras feedback dari computed styles: sukses 5.08:1, error 6.01:1. Token form/fokus aplikasi dipertahankan.
- Screenshot: `tmp/auth-confirmed-login-1440.png` dan `tmp/auth-reset-login-390.png`. Keduanya pengujian lokal, bukan bukti email produksi.
- Tidak menguji roundtrip email produksi dengan akun pemilik. Status push/deployment dijelaskan pada jawaban akhir dan handoff lokal.

## Delivery Gate, lingkup perubahan ini

- R-02 PASS: copy perubahan tanpa em dash.
- R-03 PASS: login/reset pada lima viewport tanpa overflow.
- R-17 PASS: tidak menambahkan statistik produk; angka laporan berasal dari pemeriksaan.
- R-18 PASS: tidak menambahkan testimonial.
- R-23 PASS: tidak membuat aset/identitas baru.
- R-24 PASS: login, forgot-password dan reset-password adalah route aplikasi yang tersedia.
- R-25 PASS: feedback sukses 5.08:1 dan error 6.01:1; token form dipertahankan.
- R-26 PASS: resend, reset, retry pemeriksaan dan logout diperiksa.
- R-27 PASS: checking, valid, invalid, unavailable, update gagal dan logout gagal diperiksa.
- R-28 PASS: FAQ event tidak diubah.
- R-32 PASS: input berlabel, Enter berfungsi dan fokus aplikasi dipertahankan.
- R-33 PASS: source diubah melalui apply_patch.
- R-34 PASS: tema/toggle tidak diubah.
- R-35 PASS: build, suite lokal dan alur kontrol yang berubah diperiksa; batas fixture dijelaskan.
- R-36 PASS: hasil lokal, konfigurasi remote dan roundtrip email nyata dibedakan.
- R-37 PASS: arah yang disetujui dan dials 1/1/1 dipertahankan.
- R-38 PASS: data rekaan hanya pada fixture berlabel.
- R-01 PASS: tidak menambah gradient.
- R-04 PASS: tanpa ikon dekoratif baru; ikon tampil/sembunyi password yang ada tetap berfungsi.
- R-06 PASS: font/hierarki form aplikasi dipertahankan.
- R-07 PASS: tidak menambah pola latar.
- R-08 PASS: tombol baru tanpa panah dekoratif.
- R-09 PASS: tidak menambah badge pemasaran.
- R-10 PASS: tidak menambah glassmorphism.
- R-12 PASS: tidak menambah shadow.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: hanya form yang dibutuhkan, tanpa kartu fitur tambahan.
- R-19 PASS: tidak menambah animasi.
- R-22 PASS: tidak menambah ilustrasi.
- Liveliness PASS: dials 1/1/1, input/CTA sebagai fokus, jarak mengelompokkan status, aksen ungu dan tipografi mempertahankan identitas.
- C-1 PASS: instruksi dan feedback mengikuti tahap pemulihan.
- C-2 PASS: tiap tombol melakukan submit, resend, retry atau navigasi sesuai label.
- C-3 PASS: konten menjawab konfirmasi dan penggantian password.
- C-4 PASS: gagal, retry, keyboard dan lima viewport diperiksa.
- C-5 PASS: tidak mengklaim email/akun produksi diuji end-to-end.
- R-05 PASS: komposisi memakai form autentikasi yang ada.
- R-11 PASS: radius Panel, input dan tombol mengikuti komponen bersama.
- R-15 PASS: CTA menyebut Kirim ulang konfirmasi, Simpan kata sandi dan Periksa lagi.
- R-16 PASS: copy menjelaskan tindakan tanpa buzzword.
- R-20 PASS: shell/identitas Awan Event dipertahankan.
- R-21 PASS: tema operasional terang yang disetujui dipertahankan.
- R-29 PASS: palet brand, netral dan status yang ada dipakai.
- R-30 PASS: tidak meniru produk lain.
- R-31 PASS: alasan hierarki/feedback tercatat di atas.
- UI checklist PASS: label, feedback, fokus, retry, responsif dan navigasi diperiksa dalam lingkup perubahan.

Konfigurasi URL Supabase sudah aktif. Rilis aplikasi mengikuti izin push otomatis setelah pemeriksaan. Untuk verifikasi email nyata, minta tautan baru dari `https://awanevent.com/forgot-password` dan buka pada browser yang sama.

export function authErrorMessage(error: unknown): string {
  const value = error as { code?: string; message?: string };
  const code = value?.code;
  const message = value?.message || "";
  if (code === "invalid_credentials" || /invalid login/i.test(message)) return "Email atau kata sandi salah.";
  if (code === "email_not_confirmed" || /email not confirmed/i.test(message)) return "Konfirmasi email Anda terlebih dahulu.";
  if (code === "user_already_exists" || code === "email_exists" || /already registered/i.test(message)) return "Email sudah terdaftar. Silakan masuk.";
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || /rate limit/i.test(message)) return "Terlalu banyak percobaan. Coba lagi nanti.";
  if (code === "weak_password") return "Kata sandi belum memenuhi persyaratan keamanan. Gunakan kata sandi yang lebih kuat.";
  if (code === "same_password") return "Gunakan kata sandi yang berbeda dari kata sandi sebelumnya.";
  if (code === "otp_expired" || code === "session_not_found" || code === "refresh_token_not_found") return "Tautan atau sesi sudah tidak berlaku. Masuk kembali atau minta tautan pemulihan baru.";
  if (/failed to fetch|network|fetch failed/i.test(message)) return "Tidak dapat terhubung. Periksa koneksi Anda, lalu coba lagi.";
  if (message === "Layanan akun belum tersedia. Silakan coba lagi nanti." || message === "Sesi belum dapat dimuat. Coba masuk kembali.") return message;
  return "Permintaan akun belum berhasil. Silakan coba lagi.";
}

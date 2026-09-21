import "server-only";

export class CertificateEmailConfigurationError extends Error {
  constructor() {
    super("Konfigurasi email sertifikat belum lengkap.");
    this.name = "CertificateEmailConfigurationError";
  }
}

export class CertificateEmailDeliveryError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("Penyedia email menolak pengiriman sertifikat.");
    this.name = "CertificateEmailDeliveryError";
    this.status = status;
  }
}

export type CertificateEmailInput = {
  recipientEmail: string;
  recipientName: string;
  webinarTitle: string;
  certificateNumber: string;
  issuedAt: string;
  downloadUrl: string;
  verificationUrl: string;
};

const issuedAtFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeZone: "Asia/Jakarta",
});

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

function parsePublicUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError("Tautan sertifikat harus berupa URL absolut.");
  }

  const localDevelopmentHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(localDevelopmentHost && url.protocol === "http:")) {
    throw new TypeError("Tautan sertifikat harus menggunakan HTTPS.");
  }

  return url.toString();
}

export function createCertificateEmailContent(input: CertificateEmailInput) {
  const issuedAtDate = new Date(input.issuedAt);
  if (!Number.isFinite(issuedAtDate.getTime())) {
    throw new TypeError("Tanggal penerbitan sertifikat tidak valid.");
  }

  const downloadUrl = parsePublicUrl(input.downloadUrl);
  const verificationUrl = parsePublicUrl(input.verificationUrl);
  const issuedAt = issuedAtFormatter.format(issuedAtDate);
  const safeName = escapeHtml(input.recipientName);
  const safeTitle = escapeHtml(input.webinarTitle);
  const safeCertificateNumber = escapeHtml(input.certificateNumber);
  const safeDownloadUrl = escapeHtml(downloadUrl);
  const safeVerificationUrl = escapeHtml(verificationUrl);

  return {
    subject: `Sertifikat ${input.webinarTitle} sudah tersedia`,
    text: [
      `Halo ${input.recipientName},`,
      "",
      `Sertifikat untuk ${input.webinarTitle} sudah diterbitkan.`,
      `Nomor sertifikat: ${input.certificateNumber}`,
      `Tanggal terbit: ${issuedAt}`,
      "",
      `Unduh sertifikat: ${downloadUrl}`,
      `Verifikasi sertifikat: ${verificationUrl}`,
      "",
      "Simpan email ini agar sertifikat dapat diunduh kembali kapan saja.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#241656;max-width:640px;margin:0 auto">
        <p style="color:#6b6480">Halo ${safeName},</p>
        <h1 style="font-size:30px;line-height:1.2;margin:16px 0">Sertifikatmu sudah tersedia.</h1>
        <p>Terima kasih telah mengikuti <strong>${safeTitle}</strong>. Sertifikat digitalmu telah diterbitkan dan siap diunduh.</p>
        <div style="margin:26px 0;padding:18px 20px;border:1px solid #e9e1fb;border-radius:16px;background:#faf9ff">
          <div style="font-size:12px;color:#6b6480">Nomor sertifikat</div>
          <strong style="display:block;margin-top:4px;font-family:monospace">${safeCertificateNumber}</strong>
          <div style="margin-top:12px;font-size:12px;color:#6b6480">Tanggal terbit</div>
          <span>${issuedAt}</span>
        </div>
        <p style="margin:28px 0">
          <a href="${safeDownloadUrl}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#32186b;color:#fff;text-decoration:none;font-weight:700">Unduh sertifikat</a>
        </p>
        <p style="font-size:13px;color:#6b6480">Keaslian sertifikat dapat diperiksa melalui <a href="${safeVerificationUrl}" style="color:#5b3cc4">halaman verifikasi publik</a>.</p>
        <p style="margin-top:28px">Simpan email ini agar sertifikat dapat diunduh kembali kapan saja.</p>
      </div>
    `,
  };
}

export async function sendCertificateEmail(input: CertificateEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CERTIFICATE_FROM_EMAIL ?? process.env.PAYMENT_RECEIPT_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new CertificateEmailConfigurationError();
  }

  const content = createCertificateEmailContent(input);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `certificate/${input.certificateNumber}`,
    },
    body: JSON.stringify({
      from,
      to: [input.recipientEmail],
      ...content,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new CertificateEmailDeliveryError(response.status);
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("id" in result) ||
    typeof result.id !== "string"
  ) {
    throw new CertificateEmailDeliveryError(502);
  }

  return { messageId: result.id };
}

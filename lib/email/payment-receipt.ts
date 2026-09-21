import "server-only";

export class PaymentReceiptConfigurationError extends Error {
  constructor() {
    super("Konfigurasi email tanda terima belum lengkap.");
    this.name = "PaymentReceiptConfigurationError";
  }
}

export class PaymentReceiptDeliveryError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("Penyedia email menolak pengiriman tanda terima.");
    this.name = "PaymentReceiptDeliveryError";
    this.status = status;
  }
}

type PaymentReceiptInput = {
  recipientEmail: string;
  recipientName: string;
  webinarTitle: string;
  registrationReference: string;
  transactionId: string;
  amount: number;
  paidAt: string;
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
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

export async function sendPaymentReceipt(input: PaymentReceiptInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PAYMENT_RECEIPT_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new PaymentReceiptConfigurationError();
  }

  const amount = currencyFormatter.format(input.amount);
  const paidAt = dateFormatter.format(new Date(input.paidAt));
  const safeName = escapeHtml(input.recipientName);
  const safeTitle = escapeHtml(input.webinarTitle);
  const safeReference = escapeHtml(input.registrationReference);
  const safeTransactionId = escapeHtml(input.transactionId);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `payment-receipt/${input.transactionId}`,
    },
    body: JSON.stringify({
      from,
      to: [input.recipientEmail],
      subject: `Tanda terima pembayaran ${input.webinarTitle}`,
      text: [
        `Halo ${input.recipientName},`,
        "",
        `Pembayaran untuk ${input.webinarTitle} sudah kami terima.`,
        `Nomor pendaftaran: ${input.registrationReference}`,
        `Nomor transaksi: ${input.transactionId}`,
        `Total: ${amount}`,
        `Dibayar pada: ${paidAt} WIB`,
        "",
        "Simpan email ini sebagai tanda terima pembayaran.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#241656;max-width:640px;margin:0 auto">
          <p>Halo ${safeName},</p>
          <h1 style="font-size:28px;line-height:1.2">Pembayaran sudah diterima.</h1>
          <p>Pendaftaran untuk <strong>${safeTitle}</strong> kini berstatus lunas.</p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            <tr><td style="padding:8px 0;color:#6b6480">Nomor pendaftaran</td><td style="padding:8px 0;text-align:right">${safeReference}</td></tr>
            <tr><td style="padding:8px 0;color:#6b6480">Nomor transaksi</td><td style="padding:8px 0;text-align:right">${safeTransactionId}</td></tr>
            <tr><td style="padding:8px 0;color:#6b6480">Total</td><td style="padding:8px 0;text-align:right"><strong>${amount}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#6b6480">Waktu pembayaran</td><td style="padding:8px 0;text-align:right">${paidAt} WIB</td></tr>
          </table>
          <p>Simpan email ini sebagai tanda terima pembayaran.</p>
        </div>
      `,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new PaymentReceiptDeliveryError(response.status);
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("id" in result) ||
    typeof result.id !== "string"
  ) {
    throw new PaymentReceiptDeliveryError(502);
  }

  return { messageId: result.id };
}

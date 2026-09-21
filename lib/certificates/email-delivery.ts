import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  type CertificateEmailInput,
  sendCertificateEmail,
} from "@/lib/email/certificate-delivery";
import { getServiceSupabaseClient } from "@/lib/supabase/server";

export type CertificateEmailStatusErrorCode =
  | "CERTIFICATE_NOT_FOUND"
  | "CERTIFICATE_QUERY_FAILED"
  | "CERTIFICATE_NUMBER_MISMATCH"
  | "CERTIFICATE_EMAIL_STATUS_UPDATE_FAILED";

export class CertificateEmailStatusError extends Error {
  readonly code: CertificateEmailStatusErrorCode;

  constructor(code: CertificateEmailStatusErrorCode, message: string) {
    super(message);
    this.name = "CertificateEmailStatusError";
    this.code = code;
  }
}

type CertificateEmailDeliveryOptions = {
  sentAt?: Date;
  supabase?: SupabaseClient<Database>;
};

export async function deliverCertificateEmail(
  certificateId: string,
  input: CertificateEmailInput,
  options: CertificateEmailDeliveryOptions = {},
) {
  const supabase = options.supabase ?? getServiceSupabaseClient();
  const { data: certificate, error: certificateError } = await supabase
    .from("certificates")
    .select("id,certificate_number,email_sent_at,email_message_id")
    .eq("id", certificateId)
    .maybeSingle();

  if (certificateError) {
    throw new CertificateEmailStatusError(
      "CERTIFICATE_QUERY_FAILED",
      "Status email sertifikat belum dapat diperiksa.",
    );
  }
  if (!certificate) {
    throw new CertificateEmailStatusError(
      "CERTIFICATE_NOT_FOUND",
      "Sertifikat tidak ditemukan.",
    );
  }
  if (certificate.email_sent_at && certificate.email_message_id) {
    return {
      status: "already_sent" as const,
      messageId: certificate.email_message_id,
      sentAt: certificate.email_sent_at,
    };
  }
  if (certificate.certificate_number !== input.certificateNumber) {
    throw new CertificateEmailStatusError(
      "CERTIFICATE_NUMBER_MISMATCH",
      "Nomor sertifikat tidak cocok dengan data email.",
    );
  }

  const { messageId } = await sendCertificateEmail(input);
  const sentAt = options.sentAt ?? new Date();
  if (!Number.isFinite(sentAt.getTime())) {
    throw new TypeError("Waktu pengiriman email sertifikat tidak valid.");
  }

  const sentAtIso = sentAt.toISOString();
  const { data: updatedCertificate, error: updateError } = await supabase
    .from("certificates")
    .update({
      email_sent_at: sentAtIso,
      email_message_id: messageId,
    })
    .eq("id", certificate.id)
    .is("email_sent_at", null)
    .select("email_sent_at,email_message_id")
    .maybeSingle();

  if (updateError) {
    throw new CertificateEmailStatusError(
      "CERTIFICATE_EMAIL_STATUS_UPDATE_FAILED",
      "Status pengiriman email sertifikat gagal disimpan.",
    );
  }
  if (updatedCertificate?.email_sent_at && updatedCertificate.email_message_id) {
    return {
      status: "sent" as const,
      messageId: updatedCertificate.email_message_id,
      sentAt: updatedCertificate.email_sent_at,
    };
  }

  const { data: concurrentCertificate, error: concurrentError } = await supabase
    .from("certificates")
    .select("email_sent_at,email_message_id")
    .eq("id", certificate.id)
    .single();

  if (
    concurrentError ||
    !concurrentCertificate.email_sent_at ||
    !concurrentCertificate.email_message_id
  ) {
    throw new CertificateEmailStatusError(
      "CERTIFICATE_EMAIL_STATUS_UPDATE_FAILED",
      "Status pengiriman email sertifikat gagal dikonfirmasi.",
    );
  }

  return {
    status: "already_sent" as const,
    messageId: concurrentCertificate.email_message_id,
    sentAt: concurrentCertificate.email_sent_at,
  };
}

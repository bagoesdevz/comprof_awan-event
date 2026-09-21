import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CertificateRow,
  Database,
  RegistrationRow,
  WebinarRow,
} from "@/lib/supabase/database.types";
import { getServiceSupabaseClient } from "@/lib/supabase/server";

const certificateColumns =
  "id,registration_id,certificate_number,verification_token,file_url,status,email_sent_at,email_message_id,download_count,last_download_at,created_at,updated_at";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CertificateGenerationErrorCode =
  | "INVALID_REGISTRATION_ID"
  | "REGISTRATION_NOT_FOUND"
  | "REGISTRATION_NOT_PAID"
  | "REGISTRATION_QUERY_FAILED"
  | "WEBINAR_NOT_FOUND"
  | "WEBINAR_NOT_FINISHED"
  | "WEBINAR_QUERY_FAILED"
  | "CERTIFICATE_QUERY_FAILED"
  | "CERTIFICATE_INSERT_FAILED";

export class CertificateGenerationError extends Error {
  readonly code: CertificateGenerationErrorCode;

  constructor(code: CertificateGenerationErrorCode, message: string) {
    super(message);
    this.name = "CertificateGenerationError";
    this.code = code;
  }
}

export type GeneratedCertificateData = {
  certificate: CertificateRow;
  participant: Pick<RegistrationRow, "full_name" | "email">;
  webinar: Pick<WebinarRow, "title" | "start_date" | "end_date">;
  created: boolean;
};

type GenerateCertificateOptions = {
  now?: Date;
  supabase?: SupabaseClient<Database>;
};

async function findCertificate(
  supabase: SupabaseClient<Database>,
  registrationId: string,
) {
  return supabase
    .from("certificates")
    .select(certificateColumns)
    .eq("registration_id", registrationId)
    .maybeSingle();
}

export async function generateCertificateData(
  registrationId: string,
  options: GenerateCertificateOptions = {},
): Promise<GeneratedCertificateData> {
  const normalizedRegistrationId = registrationId.trim().toLowerCase();
  if (!uuidPattern.test(normalizedRegistrationId)) {
    throw new CertificateGenerationError(
      "INVALID_REGISTRATION_ID",
      "Identitas pendaftaran tidak valid.",
    );
  }

  const now = options.now ?? new Date();
  if (!Number.isFinite(now.getTime())) {
    throw new TypeError("Waktu penerbitan sertifikat tidak valid.");
  }

  const supabase = options.supabase ?? getServiceSupabaseClient();
  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .select("id,webinar_id,full_name,email,status")
    .eq("id", normalizedRegistrationId)
    .maybeSingle();

  if (registrationError) {
    throw new CertificateGenerationError(
      "REGISTRATION_QUERY_FAILED",
      "Data pendaftaran belum dapat diperiksa.",
    );
  }
  if (!registration) {
    throw new CertificateGenerationError(
      "REGISTRATION_NOT_FOUND",
      "Pendaftaran tidak ditemukan.",
    );
  }

  const { data: webinar, error: webinarError } = await supabase
    .from("webinars")
    .select("title,start_date,end_date")
    .eq("id", registration.webinar_id)
    .maybeSingle();

  if (webinarError) {
    throw new CertificateGenerationError(
      "WEBINAR_QUERY_FAILED",
      "Data webinar belum dapat diperiksa.",
    );
  }
  if (!webinar) {
    throw new CertificateGenerationError(
      "WEBINAR_NOT_FOUND",
      "Webinar untuk pendaftaran ini tidak ditemukan.",
    );
  }

  const existingResult = await findCertificate(supabase, registration.id);
  if (existingResult.error) {
    throw new CertificateGenerationError(
      "CERTIFICATE_QUERY_FAILED",
      "Data sertifikat belum dapat diperiksa.",
    );
  }
  if (existingResult.data) {
    return {
      certificate: existingResult.data,
      participant: {
        full_name: registration.full_name,
        email: registration.email,
      },
      webinar,
      created: false,
    };
  }

  if (registration.status !== "lunas") {
    throw new CertificateGenerationError(
      "REGISTRATION_NOT_PAID",
      "Sertifikat hanya dapat diterbitkan untuk peserta yang sudah lunas.",
    );
  }
  if (Date.parse(webinar.end_date) > now.getTime()) {
    throw new CertificateGenerationError(
      "WEBINAR_NOT_FINISHED",
      "Sertifikat baru dapat diterbitkan setelah webinar selesai.",
    );
  }

  const { data: certificate, error: insertError } = await supabase
    .from("certificates")
    .insert({ registration_id: registration.id })
    .select(certificateColumns)
    .single();

  if (insertError?.code === "23505") {
    const concurrentResult = await findCertificate(supabase, registration.id);
    if (!concurrentResult.error && concurrentResult.data) {
      return {
        certificate: concurrentResult.data,
        participant: {
          full_name: registration.full_name,
          email: registration.email,
        },
        webinar,
        created: false,
      };
    }
  }

  if (insertError || !certificate) {
    throw new CertificateGenerationError(
      "CERTIFICATE_INSERT_FAILED",
      "Data sertifikat belum dapat diterbitkan.",
    );
  }

  return {
    certificate,
    participant: {
      full_name: registration.full_name,
      email: registration.email,
    },
    webinar,
    created: true,
  };
}

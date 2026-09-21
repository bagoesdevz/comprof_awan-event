import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  CertificateGenerationError,
  generateCertificateData,
} from "@/lib/certificates/generator";
import {
  CertificateEmailStatusError,
  deliverCertificateEmail,
} from "@/lib/certificates/email-delivery";
import {
  CertificateEmailConfigurationError,
  CertificateEmailDeliveryError,
} from "@/lib/email/certificate-delivery";
import {
  getServiceSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const batchSize = 50;
const concurrency = 5;

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function hasValidAuthorization(header: string | null, secret: string) {
  if (!header) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return errorResponse(
      "CRON_NOT_CONFIGURED",
      "Pemicu otomatis sertifikat belum dikonfigurasi.",
      503,
    );
  }
  if (!hasValidAuthorization(request.headers.get("authorization"), cronSecret)) {
    return errorResponse("UNAUTHORIZED", "Akses pemicu otomatis ditolak.", 401);
  }

  const startedAt = new Date();

  try {
    const supabase = getServiceSupabaseClient();
    const { data: candidates, error: candidateError } = await supabase.rpc(
      "get_certificate_generation_candidates",
      {
        p_now: startedAt.toISOString(),
        p_limit: batchSize,
      },
    );

    if (candidateError) {
      console.error("Gagal memilih kandidat sertifikat otomatis", {
        code: candidateError.code,
        message: candidateError.message,
      });
      return errorResponse(
        "CERTIFICATE_CANDIDATE_QUERY_FAILED",
        "Kandidat sertifikat belum dapat diproses.",
        502,
      );
    }

    let created = 0;
    let alreadyCreated = 0;
    let emailsSent = 0;
    let emailsAlreadySent = 0;
    const failures: Array<{ registrationId: string; code: string }> = [];

    for (let index = 0; index < candidates.length; index += concurrency) {
      const slice = candidates.slice(index, index + concurrency);
      const results = await Promise.allSettled(
        slice.map(async ({ registration_id: registrationId }) => {
          const generated = await generateCertificateData(registrationId, {
            now: startedAt,
            supabase,
          });
          const token = generated.certificate.verification_token;
          const email = await deliverCertificateEmail(
            generated.certificate.id,
            {
              recipientEmail: generated.participant.email,
              recipientName: generated.participant.full_name,
              webinarTitle: generated.webinar.title,
              certificateNumber: generated.certificate.certificate_number,
              issuedAt: generated.certificate.created_at,
              downloadUrl: new URL(
                `/api/certificates/${token}/download`,
                request.nextUrl.origin,
              ).toString(),
              verificationUrl: new URL(
                `/verify/${token}`,
                request.nextUrl.origin,
              ).toString(),
            },
            { sentAt: startedAt, supabase },
          );

          return { generated, email };
        }),
      );

      results.forEach((result, resultIndex) => {
        if (result.status === "fulfilled") {
          if (result.value.generated.created) created += 1;
          else alreadyCreated += 1;
          if (result.value.email.status === "sent") emailsSent += 1;
          else emailsAlreadySent += 1;
          return;
        }

        const registrationId = slice[resultIndex].registration_id;
        const code =
          result.reason instanceof CertificateGenerationError
            ? result.reason.code
            : result.reason instanceof CertificateEmailStatusError
              ? result.reason.code
              : result.reason instanceof CertificateEmailConfigurationError
                ? "CERTIFICATE_EMAIL_NOT_CONFIGURED"
                : result.reason instanceof CertificateEmailDeliveryError
                  ? `CERTIFICATE_EMAIL_DELIVERY_${result.reason.status}`
            : "UNEXPECTED_GENERATION_ERROR";
        failures.push({ registrationId, code });
        console.error("Gagal menerbitkan data sertifikat otomatis", {
          registrationId,
          code,
        });
      });
    }

    return NextResponse.json(
      {
        success: failures.length === 0,
        data: {
          checkedAt: startedAt.toISOString(),
          candidates: candidates.length,
          created,
          alreadyCreated,
          emailsSent,
          emailsAlreadySent,
          failed: failures.length,
          failures,
        },
      },
      {
        status: failures.length === 0 ? 200 : 207,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return errorResponse(
        "SUPABASE_NOT_CONFIGURED",
        "Layanan sertifikat belum dikonfigurasi.",
        503,
      );
    }

    console.error("Kesalahan tak terduga pada pemicu sertifikat otomatis", error);
    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Terjadi kesalahan saat menerbitkan sertifikat otomatis.",
      500,
    );
  }
}

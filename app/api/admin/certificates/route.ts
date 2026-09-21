import { NextRequest, NextResponse } from "next/server";
import type { CertificateRow } from "@/lib/supabase/database.types";
import {
  getServiceSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const certificateStatuses = ["valid", "revoked"] as const;
const emailStatuses = ["pending", "sent"] as const;
type EmailStatus = (typeof emailStatuses)[number];

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

function parsePositiveInteger(value: string | null, fallback: number, maximum: number) {
  if (value === null) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) return null;
  return parsed;
}

function parseBearerToken(header: string | null) {
  if (!header) return null;

  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1].trim() || null;
}

function isCertificateStatus(value: string): value is CertificateRow["status"] {
  return certificateStatuses.some((status) => status === value);
}

function isEmailStatus(value: string): value is EmailStatus {
  return emailStatuses.some((status) => status === value);
}

export async function GET(request: NextRequest) {
  const page = parsePositiveInteger(request.nextUrl.searchParams.get("page"), 1, 100_000);
  const limit = parsePositiveInteger(request.nextUrl.searchParams.get("limit"), 20, 100);
  const rawStatus = request.nextUrl.searchParams.get("status")?.trim().toLowerCase();
  const rawEmailStatus = request.nextUrl.searchParams
    .get("emailStatus")
    ?.trim()
    .toLowerCase();

  if (page === null || limit === null) {
    return errorResponse(
      "INVALID_PAGINATION",
      "Parameter page dan limit harus berupa bilangan bulat yang valid.",
      400,
    );
  }

  let status: CertificateRow["status"] | undefined;
  if (rawStatus && rawStatus !== "all") {
    if (!isCertificateStatus(rawStatus)) {
      return errorResponse(
        "INVALID_CERTIFICATE_STATUS",
        "Status sertifikat harus valid atau revoked.",
        400,
      );
    }
    status = rawStatus;
  }

  let emailStatus: EmailStatus | undefined;
  if (rawEmailStatus && rawEmailStatus !== "all") {
    if (!isEmailStatus(rawEmailStatus)) {
      return errorResponse(
        "INVALID_EMAIL_STATUS",
        "Status email sertifikat harus pending atau sent.",
        400,
      );
    }
    emailStatus = rawEmailStatus;
  }

  const token = parseBearerToken(request.headers.get("authorization"));
  if (!token) {
    return errorResponse("AUTHENTICATION_REQUIRED", "Silakan masuk sebagai admin.", 401);
  }

  try {
    const supabase = getServiceSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return errorResponse("INVALID_SESSION", "Sesi admin tidak valid.", 401);
    }
    if (authData.user.app_metadata.role !== "admin") {
      return errorResponse(
        "ADMIN_ACCESS_REQUIRED",
        "Akun ini tidak memiliki akses dashboard admin.",
        403,
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let certificatesQuery = supabase
      .from("certificates")
      .select(
        "id,registration_id,certificate_number,status,file_url,email_sent_at,email_message_id,download_count,last_download_at,created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) {
      certificatesQuery = certificatesQuery.eq("status", status);
    }
    if (emailStatus === "sent") {
      certificatesQuery = certificatesQuery.not("email_sent_at", "is", null);
    } else if (emailStatus === "pending") {
      certificatesQuery = certificatesQuery.is("email_sent_at", null);
    }

    const { data: certificates, error: certificatesError, count } =
      await certificatesQuery;

    if (certificatesError) {
      console.error("Gagal mengambil daftar sertifikat admin", {
        code: certificatesError.code,
        message: certificatesError.message,
      });
      return errorResponse(
        "CERTIFICATES_QUERY_FAILED",
        "Daftar sertifikat belum dapat dimuat.",
        502,
      );
    }

    const registrationIds = (certificates ?? []).map(
      (certificate) => certificate.registration_id,
    );
    const { data: registrations, error: registrationsError } = registrationIds.length
      ? await supabase
          .from("registrations")
          .select("id,webinar_id,registration_reference,full_name,email")
          .in("id", registrationIds)
      : { data: [], error: null };

    if (registrationsError) {
      console.error("Gagal mengambil peserta untuk daftar sertifikat", {
        code: registrationsError.code,
        message: registrationsError.message,
      });
      return errorResponse(
        "REGISTRATIONS_QUERY_FAILED",
        "Data peserta sertifikat belum dapat dimuat.",
        502,
      );
    }

    const webinarIds = Array.from(
      new Set((registrations ?? []).map((registration) => registration.webinar_id)),
    );
    const { data: webinars, error: webinarsError } = webinarIds.length
      ? await supabase.from("webinars").select("id,title").in("id", webinarIds)
      : { data: [], error: null };

    if (webinarsError) {
      console.error("Gagal mengambil webinar untuk daftar sertifikat", {
        code: webinarsError.code,
        message: webinarsError.message,
      });
      return errorResponse(
        "WEBINARS_QUERY_FAILED",
        "Data webinar sertifikat belum dapat dimuat.",
        502,
      );
    }

    const registrationsById = new Map(
      (registrations ?? []).map((registration) => [registration.id, registration]),
    );
    const webinarsById = new Map(
      (webinars ?? []).map((webinar) => [webinar.id, webinar]),
    );

    const data = (certificates ?? []).map((certificate) => {
      const registration = registrationsById.get(certificate.registration_id);
      const webinar = registration
        ? webinarsById.get(registration.webinar_id)
        : undefined;

      return {
        id: certificate.id,
        certificateNumber: certificate.certificate_number,
        registrationReference: registration?.registration_reference ?? null,
        participantName: registration?.full_name ?? null,
        participantEmail: registration?.email ?? null,
        webinarTitle: webinar?.title ?? null,
        status: certificate.status,
        fileReady: certificate.file_url !== null,
        emailStatus: certificate.email_sent_at ? "sent" : "pending",
        emailSentAt: certificate.email_sent_at,
        emailMessageId: certificate.email_message_id,
        downloadCount: certificate.download_count,
        lastDownloadedAt: certificate.last_download_at,
        issuedAt: certificate.created_at,
      };
    });

    const total = count ?? data.length;
    return NextResponse.json(
      {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return errorResponse(
        "SUPABASE_NOT_CONFIGURED",
        "Layanan dashboard belum dikonfigurasi.",
        503,
      );
    }

    console.error("Kesalahan tak terduga pada API sertifikat admin", error);
    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Terjadi kesalahan saat memuat daftar sertifikat.",
      500,
    );
  }
}

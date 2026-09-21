import { NextRequest, NextResponse } from "next/server";
import type { PaymentRow } from "@/lib/supabase/database.types";
import {
  getServiceSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const paymentStatuses = ["pending", "paid", "failed"] as const;
const paymentMethodLabels: Record<PaymentRow["payment_method"], string> = {
  qris: "QRIS",
  "virtual-account": "Virtual account",
  card: "Kartu",
};

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
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

function isPaymentStatus(value: string): value is PaymentRow["status"] {
  return paymentStatuses.some((status) => status === value);
}

export async function GET(request: NextRequest) {
  const page = parsePositiveInteger(request.nextUrl.searchParams.get("page"), 1, 100_000);
  const limit = parsePositiveInteger(request.nextUrl.searchParams.get("limit"), 20, 100);
  const rawStatus = request.nextUrl.searchParams.get("status")?.trim().toLowerCase();

  if (page === null || limit === null) {
    return errorResponse(
      "INVALID_PAGINATION",
      "Parameter page dan limit harus berupa bilangan bulat yang valid.",
      400,
    );
  }

  let status: PaymentRow["status"] | undefined;
  if (rawStatus && rawStatus !== "all") {
    if (!isPaymentStatus(rawStatus)) {
      return errorResponse(
        "INVALID_PAYMENT_STATUS",
        "Status pembayaran harus pending, paid, atau failed.",
        400,
      );
    }
    status = rawStatus;
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
    let paymentsQuery = supabase
      .from("payments")
      .select(
        "id,registration_id,amount,payment_method,status,transaction_id,paid_at,receipt_sent_at,created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) {
      paymentsQuery = paymentsQuery.eq("status", status);
    }

    const { data: payments, error: paymentsError, count } = await paymentsQuery;
    if (paymentsError) {
      console.error("Gagal mengambil daftar pembayaran admin", {
        code: paymentsError.code,
        message: paymentsError.message,
      });
      return errorResponse(
        "PAYMENTS_QUERY_FAILED",
        "Daftar pembayaran belum dapat dimuat.",
        502,
      );
    }

    const registrationIds = (payments ?? []).map((payment) => payment.registration_id);
    const { data: registrations, error: registrationsError } = registrationIds.length
      ? await supabase
          .from("registrations")
          .select("id,webinar_id,registration_reference,full_name,email")
          .in("id", registrationIds)
      : { data: [], error: null };

    if (registrationsError) {
      console.error("Gagal mengambil peserta untuk daftar pembayaran", {
        code: registrationsError.code,
        message: registrationsError.message,
      });
      return errorResponse(
        "REGISTRATIONS_QUERY_FAILED",
        "Data peserta pembayaran belum dapat dimuat.",
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
      console.error("Gagal mengambil webinar untuk daftar pembayaran", {
        code: webinarsError.code,
        message: webinarsError.message,
      });
      return errorResponse(
        "WEBINARS_QUERY_FAILED",
        "Data webinar pembayaran belum dapat dimuat.",
        502,
      );
    }

    const registrationsById = new Map(
      (registrations ?? []).map((registration) => [registration.id, registration]),
    );
    const webinarsById = new Map(
      (webinars ?? []).map((webinar) => [webinar.id, webinar]),
    );

    const data = (payments ?? []).map((payment) => {
      const registration = registrationsById.get(payment.registration_id);
      const webinar = registration
        ? webinarsById.get(registration.webinar_id)
        : undefined;

      return {
        id: payment.id,
        transactionId: payment.transaction_id,
        registrationReference: registration?.registration_reference ?? null,
        participantName: registration?.full_name ?? null,
        participantEmail: registration?.email ?? null,
        webinarTitle: webinar?.title ?? null,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        paymentMethodLabel: paymentMethodLabels[payment.payment_method],
        status: payment.status,
        paidAt: payment.paid_at,
        receiptSentAt: payment.receipt_sent_at,
        createdAt: payment.created_at,
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

    console.error("Kesalahan tak terduga pada API pembayaran admin", error);
    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Terjadi kesalahan saat memuat daftar pembayaran.",
      500,
    );
  }
}

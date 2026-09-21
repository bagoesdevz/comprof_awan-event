import { NextRequest, NextResponse } from "next/server";
import {
  getPublicSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const publicWebinarColumns = [
  "id",
  "slug",
  "title",
  "summary",
  "category",
  "event_type",
  "city",
  "venue",
  "price",
  "credits",
  "registration_status",
  "start_date",
  "end_date",
].join(",");

const eventTypes = ["ONLINE", "ONSITE", "HYBRID"] as const;
type EventType = (typeof eventTypes)[number];

function isEventType(value: string): value is EventType {
  return eventTypes.some((eventType) => eventType === value);
}

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function parseLimit(value: string | null) {
  if (value === null) return 12;

  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) return null;

  return limit;
}

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));
  if (limit === null) {
    return errorResponse(
      "INVALID_LIMIT",
      "Parameter limit harus berupa bilangan bulat antara 1 dan 50.",
      400,
    );
  }

  const category = request.nextUrl.searchParams.get("category")?.trim();
  if (category && category.length > 100) {
    return errorResponse(
      "INVALID_CATEGORY",
      "Parameter category maksimal 100 karakter.",
      400,
    );
  }

  const eventTypeParam = request.nextUrl.searchParams.get("type")?.toUpperCase();
  let eventType: EventType | undefined;
  if (eventTypeParam) {
    if (!isEventType(eventTypeParam)) {
      return errorResponse(
        "INVALID_EVENT_TYPE",
        "Parameter type harus ONLINE, ONSITE, atau HYBRID.",
        400,
      );
    }
    eventType = eventTypeParam;
  }

  try {
    const supabase = getPublicSupabaseClient();
    let query = supabase
      .from("webinars")
      .select(publicWebinarColumns, { count: "exact" })
      .eq("is_published", true)
      .order("start_date", { ascending: true })
      .limit(limit);

    if (category) query = query.eq("category", category);
    if (eventType) query = query.eq("event_type", eventType);

    const { data, error, count } = await query;

    if (error) {
      console.error("Gagal mengambil daftar webinar", {
        code: error.code,
        message: error.message,
      });
      return errorResponse(
        "WEBINAR_QUERY_FAILED",
        "Daftar webinar belum dapat dimuat.",
        502,
      );
    }

    return NextResponse.json(
      {
        data: data ?? [],
        meta: {
          count: count ?? data?.length ?? 0,
          limit,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return errorResponse(
        "SUPABASE_NOT_CONFIGURED",
        "Layanan webinar belum dikonfigurasi.",
        503,
      );
    }

    console.error("Kesalahan tak terduga pada endpoint webinar", error);
    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Terjadi kesalahan saat memuat webinar.",
      500,
    );
  }
}

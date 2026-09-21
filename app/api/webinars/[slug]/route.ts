import { NextResponse } from "next/server";
import {
  getPublicSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

type WebinarDetailRouteProps = {
  params: { slug: string };
};

export async function GET(_request: Request, { params }: WebinarDetailRouteProps) {
  const slug = params.slug.trim().toLowerCase();
  if (slug.length > 120 || !slugPattern.test(slug)) {
    return errorResponse(
      "INVALID_SLUG",
      "Slug webinar tidak valid.",
      400,
    );
  }

  try {
    const supabase = getPublicSupabaseClient();
    const { data, error } = await supabase
      .from("webinars")
      .select(
        [
          "id",
          "slug",
          "title",
          "summary",
          "description",
          "category",
          "event_type",
          "topics",
          "benefits",
          "rundown",
          "facilities",
          "audience",
          "speakers",
          "city",
          "venue",
          "venue_address",
          "price",
          "credits",
          "registration_status",
          "start_date",
          "end_date",
        ].join(","),
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      console.error("Gagal mengambil detail webinar", {
        code: error.code,
        message: error.message,
        slug,
      });
      return errorResponse(
        "WEBINAR_QUERY_FAILED",
        "Detail webinar belum dapat dimuat.",
        502,
      );
    }

    if (!data) {
      return errorResponse(
        "WEBINAR_NOT_FOUND",
        "Webinar tidak ditemukan.",
        404,
      );
    }

    return NextResponse.json(
      { data },
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

    console.error("Kesalahan tak terduga pada endpoint detail webinar", error);
    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "Terjadi kesalahan saat memuat webinar.",
      500,
    );
  }
}

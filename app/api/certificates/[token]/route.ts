import { NextResponse } from "next/server";
import { getServiceSupabaseClient, SupabaseConfigurationError } from "@/lib/supabase/server";
import type { ManagedEvent, Registration } from "@/lib/platform-model";

export const dynamic = "force-dynamic";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  const token = params.token.trim().toLowerCase();
  if (!uuidPattern.test(token)) {
    return err("INVALID_TOKEN", "Token sertifikat tidak valid.", 422);
  }

  try {
    const supabase = getServiceSupabaseClient();

    // Cari registrasi yang memiliki certificate.token ini di platform_records
    const { data, error } = await supabase
      .from("platform_records")
      .select("id,data,owner_email")
      .eq("collection", "registrations")
      .eq("data->certificate->>token", token)
      .maybeSingle();

    if (error) {
      console.error("Certificate verify query failed", error.message);
      return err("QUERY_FAILED", "Sertifikat belum dapat diperiksa.", 502);
    }
    if (!data) {
      return err("NOT_FOUND", "Sertifikat tidak ditemukan.", 404);
    }

    const reg = data.data as unknown as Registration;
    const cert = reg.certificate;
    if (!cert) return err("NOT_FOUND", "Sertifikat tidak ditemukan.", 404);

    // Cari event terkait
    const { data: evtRow, error: evtErr } = await supabase
      .from("platform_records")
      .select("data")
      .eq("collection", "events")
      .eq("data->>slug", reg.eventSlug)
      .maybeSingle();

    if (evtErr) {
      console.error("Event query for certificate verification failed", evtErr.message);
      return err("QUERY_FAILED", "Data event belum dapat diperiksa.", 502);
    }

    const event = evtRow?.data as unknown as ManagedEvent | undefined;

    return NextResponse.json(
      {
        data: {
          certificateNumber: cert.number,
          participantName: reg.name,
          eventTitle: event?.title ?? reg.eventSlug,
          eventStartDate: event?.startAt ?? null,
          eventEndDate: event?.endAt ?? null,
          issuedAt: cert.issuedAt,
          status: cert.status,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return err("SERVICE_UNAVAILABLE", "Layanan verifikasi sertifikat belum dikonfigurasi.", 503);
    }
    console.error("Certificate verify unexpected error", error);
    return err("INTERNAL_ERROR", "Terjadi kesalahan saat memeriksa sertifikat.", 500);
  }
}

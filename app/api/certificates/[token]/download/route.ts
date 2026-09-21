import { NextResponse } from "next/server";
import { getServiceSupabaseClient, SupabaseConfigurationError } from "@/lib/supabase/server";
import type { ManagedEvent, Registration } from "@/lib/platform-model";
import { eligible } from "@/lib/platform-model";

export const dynamic = "force-dynamic";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function xmlEscape(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

/** Izinkan hanya URL Supabase storage atau path relatif */
function safeCertificateTemplateUrl(raw: string): string {
  if (!raw) return "";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const u = new URL(raw);
    if (u.protocol === "https:" && /\.supabase\.co$/.test(u.hostname)) return raw;
  } catch {
    // bukan URL valid
  }
  return "";
}

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  const token = params.token.trim().toLowerCase();
  if (!uuidPattern.test(token)) {
    return NextResponse.json({ error: "Token tidak valid." }, { status: 422 });
  }

  try {
    const supabase = getServiceSupabaseClient();

    // Cari registrasi berdasarkan certificate.token di platform_records
    const { data, error } = await supabase
      .from("platform_records")
      .select("data")
      .eq("collection", "registrations")
      .eq("data->certificate->>token", token)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Sertifikat tidak ditemukan." }, { status: 404 });
    }

    const reg = data.data as unknown as Registration;
    const cert = reg.certificate;
    if (!cert || cert.status !== "valid") {
      return NextResponse.json(
        { error: cert?.status === "revoked" ? "Sertifikat ini sudah dicabut." : "Sertifikat tidak ditemukan." },
        { status: cert?.status === "revoked" ? 410 : 404 },
      );
    }

    // Ambil event untuk template + placement + eligibility check
    const { data: evtRow } = await supabase
      .from("platform_records")
      .select("data")
      .eq("collection", "events")
      .eq("data->>slug", reg.eventSlug)
      .maybeSingle();

    const event = evtRow?.data as unknown as ManagedEvent | undefined;

    if (event && !eligible(reg, event)) {
      return NextResponse.json({ error: "Sertifikat belum memenuhi syarat." }, { status: 403 });
    }

    const placement = event?.certificatePlacement ?? {
      name: { x: 50, y: 47, size: 42, color: "#211052" },
      number: { x: 50, y: 68, size: 20, color: "#5D607D" },
    };

    const safeTemplate = safeCertificateTemplateUrl(event?.certificateTemplate ?? "");

    const imageTag = safeTemplate
      ? `<image href="${xmlEscape(safeTemplate)}" width="1400" height="990" preserveAspectRatio="xMidYMid slice"/>`
      : `<rect width="1400" height="990" fill="#F4F1FE"/>`;

    const svg = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990" viewBox="0 0 1400 990">`,
      `  <rect width="1400" height="990" fill="#FFFFFF"/>`,
      `  ${imageTag}`,
      `  <text x="${placement.name.x * 14}" y="${placement.name.y * 9.9}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${placement.name.size}" fill="${xmlEscape(placement.name.color)}">${xmlEscape(reg.name)}</text>`,
      `  <text x="${placement.number.x * 14}" y="${placement.number.y * 9.9}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${placement.number.size}" fill="${xmlEscape(placement.number.color)}">${xmlEscape(cert.number)}</text>`,
      `</svg>`,
    ].join("\n");

    const filename = encodeURIComponent(cert.number) + ".svg";

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return NextResponse.json({ error: "Layanan belum tersedia." }, { status: 503 });
    }
    console.error("Certificate download unexpected error", error);
    return NextResponse.json({ error: "Gagal mengunduh sertifikat." }, { status: 500 });
  }
}

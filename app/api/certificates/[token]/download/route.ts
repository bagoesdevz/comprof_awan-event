import { NextResponse } from "next/server";
import { getServiceSupabaseClient, SupabaseConfigurationError } from "@/lib/supabase/server";
import type { ManagedEvent, Registration } from "@/lib/platform-model";
import { certificateTemplateData } from "@/lib/server/certificate-template";
import { currentUser } from "@/lib/supabase/auth";
import { requireUser, roleOf, record, commit } from "@/lib/server/platform";
import { fail, HttpError } from "@/lib/server/http";
import { z } from "zod";
import { eligible, certificateNameVerified, certificateRecipientName } from "@/lib/platform-model";

export const dynamic = "force-dynamic";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function xmlEscape(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const route = await params;
  const token = route.token.trim().toLowerCase();
  if (!uuidPattern.test(token)) {
    return NextResponse.json({ error: "Token tidak valid." }, { status: 422 });
  }

  try {
    const user = requireUser(await currentUser());
    const supabase = getServiceSupabaseClient();

    // Cari registrasi berdasarkan certificate.token di platform_records
    const { data, error } = await supabase
      .from("platform_records")
      .select("id,data,owner_email")
      .eq("collection", "registrations")
      .eq("data->certificate->>token", token)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Sertifikat tidak ditemukan." }, { status: 404 });
    }

    if (data.owner_email !== user.email.toLowerCase() && roleOf(user) === "participant") throw new HttpError(403, "Sertifikat tidak diizinkan.");
    const reg = data.data as unknown as Registration;
    const cert = reg.certificate;
    if (!cert || cert.status !== "valid") {
      return NextResponse.json(
        { error: cert?.status === "revoked" ? "Sertifikat ini sudah dicabut." : "Sertifikat tidak ditemukan." },
        { status: cert?.status === "revoked" ? 410 : 404 },
      );
    }

    // Ambil event untuk template + placement + eligibility check
    const { data: evtRow, error: eventError } = await supabase
      .from("platform_records")
      .select("data")
      .eq("collection", "events")
      .eq("data->>slug", reg.eventSlug)
      .maybeSingle();

    const event = evtRow?.data as unknown as ManagedEvent | undefined;

    if (eventError) throw new HttpError(503, "Data event belum dapat dimuat.");
    if (!event || !event.certificateEnabled) throw new HttpError(409, "Data sertifikat belum lengkap.");
    if (!eligible(reg, event)) {
      return NextResponse.json({ error: "Sertifikat belum memenuhi syarat." }, { status: 403 });
    }
    if (!certificateNameVerified(reg)) throw new HttpError(409, "Verifikasi nama sertifikat terlebih dahulu di dashboard.");
    const recipientName = certificateRecipientName(reg);

    const point = z.object({x:z.number().min(0).max(100),y:z.number().min(0).max(100),size:z.number().min(8).max(120),color:z.string().regex(/^#[0-9a-f]{6}$/i)});
    const placement = z.object({name:point,number:point}).parse(event.certificatePlacement);
    const template = await certificateTemplateData(event.certificateTemplate);
    const imageTag = `<image href="${template}" width="1400" height="990" preserveAspectRatio="xMidYMid slice"/>`;

    const svg = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990" viewBox="0 0 1400 990">`,
      `  <rect width="1400" height="990" fill="#FFFFFF"/>`,
      `  ${imageTag}`,
      `  <text x="${placement.name.x * 14}" y="${placement.name.y * 9.9}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${placement.name.size}" fill="${xmlEscape(placement.name.color)}">${xmlEscape(recipientName)}</text>`,
      `  <text x="${placement.number.x * 14}" y="${placement.number.y * 9.9}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${placement.number.size}" fill="${xmlEscape(placement.number.color)}">${xmlEscape(cert.number)}</text>`,
      `</svg>`,
    ].join("\n");

    const fresh = await record("registrations",data.id);
    const current = fresh?.data as unknown as Registration | undefined;
    if (!fresh || !current?.certificate || current.certificate.token !== token || current.certificate.status !== "valid" || !eligible(current,event) || !certificateNameVerified(current)) throw new HttpError(403,"Sertifikat tidak dapat diunduh.");
    if (certificateRecipientName(current) !== recipientName) throw new HttpError(409,"Data sertifikat berubah. Muat ulang halaman sebelum mengunduh.");
    current.certificate.downloadCount = (current.certificate.downloadCount || 0) + 1;
    current.certificate.lastDownloadedAt = new Date().toISOString();
    await commit([{collection:"registrations",id:fresh.id,revision:fresh.revision,owner_email:fresh.owner_email,data:current as unknown as Record<string,unknown>}]);
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
    return fail(error);
  }
}

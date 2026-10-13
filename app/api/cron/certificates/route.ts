import { timingSafeEqual } from "node:crypto";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { record, findEvent, commit } from "@/lib/server/platform";
import { issueCertificate } from "@/lib/server/certificates";
import { sendCertificateEmail } from "@/lib/email/certificate-delivery";
import { fail, json, HttpError } from "@/lib/server/http";
import type { Registration, ManagedEvent } from "@/lib/platform-model";
import { eligible } from "@/lib/platform-model";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) throw new HttpError(503, "Pemicu sertifikat belum dikonfigurasi.");
    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(request.headers.get("authorization") || "");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) throw new HttpError(401, "Akses ditolak.");
    const started = Date.now();
    const {data,error} = await getServiceSupabaseClient().rpc("platform_certificate_candidates", {p_limit:50});
    if (error) throw new HttpError(503, "Kandidat sertifikat belum dapat dimuat.");
    let created = 0, emailsSent = 0;
    const failures: string[] = [];
    for (const candidate of data || []) {
      if (Date.now() - started > 40000) break;
      try {
        const row = await record("registrations", candidate.registration_id);
        if (!row) continue;
        const registration = row.data as unknown as Registration;
        const eventRow = await findEvent(registration.eventSlug);
        const event = eventRow.data as unknown as ManagedEvent;
        const issued = issueCertificate(registration,event);
        const certificate = registration.certificate;
        if (!certificate || certificate.status !== "valid" || !eligible(registration,event)) continue;
        const send = !certificate.emailSentAt && (!certificate.emailClaimUntil || Date.parse(certificate.emailClaimUntil) <= Date.now());
        if (!issued && !send) continue;
        if (send) certificate.emailClaimUntil = new Date(Date.now()+10*60000).toISOString();
        await commit([{collection:"registrations",id:row.id,revision:row.revision,owner_email:row.owner_email,data:registration as unknown as Record<string,unknown>}]);
        if (issued) created++;
        if (!send) continue;
        const origin = new URL(request.url).origin;
        const delivered = await sendCertificateEmail({
          recipientEmail:registration.email,recipientName:registration.name,webinarTitle:event.title,
          certificateNumber:certificate.number,issuedAt:certificate.issuedAt,
          downloadUrl:new URL("/dashboard/certificates",origin).href,
          verificationUrl:new URL(`/verify/${certificate.token}`,origin).href,
        });
        const fresh = await record("registrations",row.id);
        if (!fresh) throw new Error("Registration unavailable after delivery");
        const updated = fresh.data as unknown as Registration;
        if (updated.certificate?.token !== certificate.token) throw new Error("Certificate changed after delivery");
        updated.certificate.emailSentAt = new Date().toISOString();
        updated.certificate.emailMessageId = delivered.messageId;
        delete updated.certificate.emailClaimUntil;
        delete updated.certificate.emailError;
        await commit([{collection:"registrations",id:fresh.id,revision:fresh.revision,owner_email:fresh.owner_email,data:updated as unknown as Record<string,unknown>}]);
        emailsSent++;
      } catch {
        failures.push(candidate.registration_id);
        try {
          const row=await record("registrations",candidate.registration_id);
          const registration=row?.data as unknown as Registration|undefined;
          if(row&&registration?.certificate&&!registration.certificate.emailSentAt){
            registration.certificate.emailError="Pengiriman belum berhasil. Periksa konfigurasi email dan coba kembali.";
            await commit([{collection:"registrations",id:row.id,revision:row.revision,owner_email:row.owner_email,data:registration as unknown as Record<string,unknown>}]);
          }
        } catch { console.error("Certificate retry state unavailable"); }
      }
    }
    return json({data:{created,emailsSent,failed:failures.length,failures}}, failures.length ? 207 : 200);
  } catch (error) { return fail(error); }
}

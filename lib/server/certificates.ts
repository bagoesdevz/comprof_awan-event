import "server-only";
import { eligible, type Registration, type ManagedEvent } from "@/lib/platform-model";

export function issueCertificate(registration: Registration, event: ManagedEvent, now = new Date()) {
  const endsAt=Date.parse(event.endAt);
  if (event.publication!=="published" || !Number.isFinite(endsAt) || !event.certificateEnabled || !event.certificateTemplate || !eligible(registration, event) || registration.certificate || endsAt > now.getTime()) return false;
  registration.certificate = {
    token: crypto.randomUUID(),
    number: event.certificatePattern.replaceAll("{year}", String(now.getUTCFullYear())).replaceAll("{sequence}", registration.id.replace("AWN-", "")),
    issuedAt: now.toISOString(),
    status: "valid",
  };
  return true;
}

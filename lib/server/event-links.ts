import "server-only";
import { randomBytes } from "node:crypto";
import type { User } from "@supabase/supabase-js";
import { isEventPublicCode } from "@/lib/event-sharing";
import { commit, records, requireAdmin } from "./platform";

export function createEventPublicCode(used: Set<string>) {
  let code: string;
  do { code = randomBytes(16).toString("hex"); } while (used.has(code));
  used.add(code);
  return code;
}

export async function ensureEventPublicLinks(user: User | null) {
  requireAdmin(user);
  const events = await records("events");
  const used = new Set(events.map(event => event.data.publicCode).filter(isEventPublicCode));
  const missing = events.filter(event => !event.data.deletedAt && !isEventPublicCode(event.data.publicCode));
  for (let index = 0; index < missing.length; index += 100) {
    await commit(missing.slice(index, index + 100).map(event => ({
      collection: "events", id: event.id, revision: event.revision, published: event.published, owner_email: event.owner_email,
      data: { ...event.data, publicCode: createEventPublicCode(used) },
    })));
  }
  return { created: missing.length };
}

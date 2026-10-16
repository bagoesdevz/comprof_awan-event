import "server-only";
import { z } from "zod";
import type { User } from "@supabase/supabase-js";
import { commit, hasEventRegistrations, record, requireAdmin } from "./platform";
import { HttpError } from "./http";

export async function changeEventTrash(user: User | null, raw: unknown) {
  const actor = requireAdmin(user, true);
  const input = z.object({ type: z.enum(["delete-event", "restore-event"]), id: z.string().min(1).max(254), confirmed: z.literal(true) }).strict().parse(raw);
  const row = await record("events", input.id);
  if (!row) throw new HttpError(404, "Event tidak ditemukan.");
  const data = structuredClone(row.data);
  if (input.type === "delete-event") {
    if (data.deletedAt) return { message: "Event sudah berada di Sampah." };
    if (await hasEventRegistrations(String(data.slug))) throw new HttpError(409, "Event memiliki pendaftaran. Gunakan Jadikan draf untuk menghentikan publikasi tanpa mengganggu riwayat peserta.");
    data.deletedAt = new Date().toISOString();
    data.deletedBy = actor.id;
  } else {
    if (!data.deletedAt) throw new HttpError(409, "Event tidak berada di Sampah.");
    delete data.deletedAt;
    delete data.deletedBy;
  }
  data.publication = "draft";
  data.registrationStatus = "CLOSED";
  await commit([{ collection: "events", id: row.id, revision: row.revision, data, published: false, owner_email: row.owner_email }]);
  return { message: input.type === "delete-event" ? "Event dipindahkan ke Sampah." : "Event dipulihkan sebagai draf. Periksa pengaturan sebelum menayangkan kembali." };
}

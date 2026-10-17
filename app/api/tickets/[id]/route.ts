import { currentUser } from "@/lib/supabase/auth";
import { findEvent, liveEvent, record, requireUser } from "@/lib/server/platform";
import { fail, HttpError, json, rateLimit } from "@/lib/server/http";
import { admissionTicket, registrationTicketPrice } from "@/lib/admission-ticket";
import type { ManagedEvent, Registration } from "@/lib/platform-model";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireUser(await currentUser());
    const { id } = await params;
    if (!/^AWN-[A-Z0-9]{10,32}$/.test(id)) throw new HttpError(422, "Kode tiket tidak valid.");
    await rateLimit("ticket:" + user.id, 30);
    const row = await record("registrations", id);
    if (!row || row.owner_email !== user.email.toLowerCase()) throw new HttpError(404, "Tiket tidak ditemukan.");
    const registration = structuredClone(row.data) as unknown as Registration;
    if (registration.id !== id || registration.email.toLowerCase() !== user.email.toLowerCase()) throw new HttpError(404, "Tiket tidak ditemukan.");
    if (registration.orderId) {
      const parent = await record("registrations", registration.orderId);
      const order = parent?.data as unknown as Registration | undefined;
      if (!order || order.eventSlug !== registration.eventSlug || order.ticketId !== registration.ticketId || order.payment !== "paid") throw new HttpError(409, "Pembayaran tiket grup belum terkonfirmasi.");
      if (registration.ticketPrice === undefined) registration.ticketPrice = registrationTicketPrice(order);
    }
    const eventRow = await findEvent(registration.eventSlug);
    const ticket = admissionTicket(registration, liveEvent(eventRow.data as unknown as ManagedEvent));
    if (!ticket) throw new HttpError(404, "E-tiket hanya tersedia untuk pendaftaran berbayar yang sudah lunas atau kehadiran tatap muka.");
    return json({ data: ticket });
  } catch (error) { return fail(error); }
}

import type { ManagedEvent, Registration } from "@/lib/platform-model";

export type AdmissionTicket = {
  reference: string;
  participant: string;
  ticketName: string;
  eventTitle: string;
  startAt: string;
  endAt: string;
  attendance: "ONLINE" | "ONSITE";
  location: string;
  status: string;
  paid: boolean;
};

export function registrationTicketPrice(registration: Registration) {
  const price = registration.amount > 0 ? registration.amount / Math.max(1, registration.quantity) : registration.ticketPrice ?? 0;
  return Number.isFinite(price) && price > 0 ? price : 0;
}

export function hasAdmissionTicket(registration: Registration, event: ManagedEvent | undefined) {
  return !!event && !event.deletedAt && registration.payment === "paid" &&
    (registration.attendance === "ONSITE" || event.type === "ONSITE" || registrationTicketPrice(registration) > 0);
}

export function admissionTicket(registration: Registration, event: ManagedEvent): AdmissionTicket | null {
  if (!hasAdmissionTicket(registration, event)) return null;
  const attendance = event.type === "ONSITE" ? "ONSITE" : registration.attendance;
  const location = attendance === "ONLINE" ? `Online melalui ${event.meetingProvider}` :
    [...new Set([event.venue, event.venueAddress, event.city].filter(Boolean))].join(", ") || "Lokasi akan diumumkan";
  return {
    reference: registration.id, participant: registration.name, ticketName: registration.ticketName,
    eventTitle: event.title, startAt: event.startAt, endAt: event.endAt, attendance, location,
    status: registration.progress.attendance ? "Kehadiran tercatat" : event.lifecycle === "completed" ? "Event selesai" : "Siap digunakan",
    paid: registrationTicketPrice(registration) > 0,
  };
}

export function ticketSchedule(ticket: Pick<AdmissionTicket, "startAt" | "endAt">) {
  const start = new Date(ticket.startAt), end = new Date(ticket.endAt);
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" });
  const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Jakarta" });
  const endValid = Number.isFinite(end.getTime()) && end > start;
  return {
    date: date.format(start),
    time: time.format(start) + (endValid ? (date.format(end) === date.format(start) ? ` s.d. ${time.format(end)}` : ` WIB s.d. ${date.format(end)}, ${time.format(end)}`) : "") + " WIB",
  };
}

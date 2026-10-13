import type { TicketOption } from "@/lib/event-types";
import type { Block, ManagedEvent } from "@/lib/platform-model";

export type Attendance = "ONLINE" | "ONSITE";
export const attendanceLabels = { ONLINE: "Online", ONSITE: "Tatap muka", HYBRID: "Hybrid" };
export function eventAttendanceMode(event: ManagedEvent): Attendance {
  const programType = event.programType.toLowerCase();
  if (programType === "webinar") return "ONLINE";
  if (programType === "seminar") return "ONSITE";
  return event.type === "ONSITE" ? "ONSITE" : "ONLINE";
}
export const eventDate = (value: string) => new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(value));
export const eventDateTime = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(value)) + " WIB";

export function ticketState(event: ManagedEvent, ticket: TicketOption, now: number) {
  if (event.lifecycle === "completed") return "completed";
  if (ticket.status === "inactive" || event.registrationStatus === "CLOSED") return "closed";
  if (event.registrationStatus === "COMING_SOON" || (ticket.startsAt && Date.parse(ticket.startsAt) > now)) return "scheduled";
  if (ticket.endsAt && Date.parse(ticket.endsAt) < now) return "expired";
  if (event.registrationStatus === "SOLD_OUT" || event.quotaLeft <= 0 || ticket.quotaLeft <= 0) return "full";
  return "available";
}

export function attendanceOptions(event: ManagedEvent): Attendance[] {
  return event.type === "HYBRID" && !["webinar", "seminar"].includes(event.programType.toLowerCase()) ? ["ONLINE", "ONSITE"] : [eventAttendanceMode(event)];
}

export function eventPrice(event: ManagedEvent) {
  const tickets = event.tickets.filter(ticket => ticket.status !== "inactive");
  return tickets.length ? Math.min(...tickets.map(ticket => ticket.price)) : null;
}

export function participationSteps(event: ManagedEvent, attendance: Attendance) {
  const free = event.tickets.filter(ticket => ticket.attendance === attendance && ticket.status !== "inactive").every(ticket => ticket.price === 0);
  if (attendance === "ONSITE") return [
    { title: free ? "Pilih tiket" : "Pilih tiket & bayar", text: free ? "Lengkapi pendaftaran untuk mendapatkan tiket." : "Lengkapi pendaftaran dan selesaikan pembayaran melalui Midtrans." },
    { title: "Siapkan tiket QR", text: `Buka tiket di dashboard setelah pendaftaran ${free ? "terkonfirmasi" : "dan pembayaran selesai"}.` },
    { title: "Check-in di venue", text: "Tunjukkan tiket QR kepada petugas agar kehadiran tercatat." },
    { title: "Ikuti kegiatan", text: "Hadiri sesi dan lengkapi evaluasi sesuai ketentuan program." },
  ];
  const webinar = event.programType === "Webinar";
  return [
    { title: free ? "Daftar" : "Daftar & bayar", text: free ? "Gunakan satu akun untuk mendaftar dan mengakses kegiatan." : "Satu akun untuk pendaftaran, pembayaran, dan akses kegiatan." },
    ...(event.preTest.enabled ? [{ title: "Kerjakan pre-test", text: "Lengkapi tes awal yang tersedia di dashboard peserta." }] : []),
    { title: webinar ? "Gabung webinar" : "Ikuti sesi online", text: `Akses ${event.meetingProvider} melalui dashboard dan pastikan kehadiran tercatat.` },
    { title: event.certificateEnabled ? "Evaluasi & sertifikat" : "Evaluasi acara", text: `${event.postTest.enabled ? "Selesaikan post-test dan evaluasi acara." : "Isi evaluasi acara setelah sesi berakhir."}${event.certificateEnabled ? " Sertifikat terbit setelah seluruh syarat terpenuhi." : ""}` },
  ];
}

export function eventFaq(event: ManagedEvent, attendance: Attendance) {
  const free = event.tickets.filter(ticket => ticket.attendance === attendance && ticket.status !== "inactive").every(ticket => ticket.price === 0);
  const faqs = attendance === "ONLINE" ? [
    { question: "Bagaimana cara mengikuti sesi online?", answer: `${free ? "Setelah pendaftaran terkonfirmasi" : "Setelah pembayaran berhasil"}, ${event.preTest.enabled ? "kerjakan pre-test di dashboard. " : ""}Akses ${event.meetingProvider} tersedia melalui dashboard saat event dimulai. Tautan meeting tidak dibagikan di halaman publik.` },
    { question: "Apakah tersedia rekaman kegiatan?", answer: "Ketersediaan dan masa akses rekaman mengikuti manfaat tiket yang dipilih. Periksa rincian tiket; tidak semua paket menyertakan rekaman." },
    { question: "Apakah tersedia sertifikat?", answer: event.certificateEnabled ? `Selesaikan ${[event.preTest.enabled && "pre-test", "kehadiran", event.postTest.enabled && "post-test", "evaluasi acara"].filter(Boolean).join(", ")}. Sertifikat tersedia di dashboard setelah seluruh syarat terpenuhi.` : "Event ini tidak menyediakan sertifikat." },
  ] : [
    { question: "Bagaimana cara menggunakan tiket di venue?", answer: "Setelah pembayaran berhasil, tiket QR tersedia di dashboard. Tunjukkan QR kepada petugas saat check-in di lokasi kegiatan agar kehadiran tercatat." },
    { question: "Apa yang perlu disiapkan untuk hadir?", answer: "Siapkan tiket QR dan identitas sesuai data pendaftaran. Periksa agenda serta alamat venue sebelum berangkat. Fasilitas, konsumsi, dan perlengkapan mengikuti manfaat tiket yang dipilih." },
    { question: "Apakah peserta tatap muka mendapat rekaman dan sertifikat?", answer: "Fasilitas mengikuti rincian tiket. Rekaman tidak otomatis termasuk pada tiket tatap muka. Jika tiket menyertakan sertifikat, lengkapi persyaratan kegiatan, kehadiran, dan evaluasi yang ditampilkan di dashboard." },
  ];
  return [...faqs,
    { question: free ? "Bagaimana proses pendaftaran?" : "Bagaimana proses pembayaran?", answer: free ? "Pilih tiket gratis, masuk atau buat akun, lalu lengkapi pendaftaran. Tiket langsung terkonfirmasi tanpa pembayaran." : "Pilih tiket, masuk atau buat akun, lengkapi profil, lalu lanjutkan pembayaran melalui Midtrans. Pendaftaran terkonfirmasi setelah pembayaran berhasil." },
    { question: "Bagaimana jika kuota sudah penuh?", answer: event.waitlist ? "Gabung daftar tunggu pada tiket yang penuh. Tim akan menghubungi Anda jika kursi tersedia. Masuk daftar tunggu belum menjamin alokasi kursi." : "Pendaftaran ditutup saat kuota penuh. Anda dapat memilih tiket lain yang tersedia atau melihat jadwal event berikutnya." },
  ];
}

// Only the untouched legacy default order is upgraded. Builder customization wins.
export function presentationBlocks(blocks: Block[]) {
  const legacy = "Hero,About,Speaker,Benefits,Agenda,Ticket,Countdown,FAQ,CTA";
  if (blocks.map(block => block.type).join(",") !== legacy) return blocks.filter(block => block.visible);
  const order = ["Hero", "Speaker", "About", "Benefits", "Agenda", "Ticket", "Countdown", "FAQ", "CTA"];
  return order.flatMap(type => blocks.filter(block => block.type === type && block.visible));
}

export function blockTitle(block: Block, fallback: string) {
  return block.title && block.title !== block.type ? block.title : fallback;
}

export function eventHeroContent(event: ManagedEvent, block: Block) {
  return {
    title: blockTitle(block, event.title),
    summary: block.body.trim() ? block.body : event.summary || event.description,
    visual: eventVisual(event, block),
  };
}

export function eventVisual(event: ManagedEvent, block?: Block) {
  const uploaded = block?.image || event.banner;
  if (uploaded) return { src: uploaded, illustrative: false };
  return null;
}

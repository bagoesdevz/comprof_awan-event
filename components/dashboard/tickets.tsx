"use client";

import Image from "next/image";
import { useState } from "react";
import { Download, Ticket } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { Empty, PageHeading, Panel } from "@/components/platform/ui";
import { admissionTicket, ticketSchedule, type AdmissionTicket } from "@/lib/admission-ticket";
import { downloadTicket } from "@/lib/ticket-export";
import { TicketCode } from "./ticket-code";

function TicketCard({ ticket }: { ticket: AdmissionTicket }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const schedule = ticketSchedule(ticket);
  const downloadError = "Tiket belum dapat diunduh. Periksa koneksi internet dan coba lagi.";
  async function download() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/tickets/${encodeURIComponent(ticket.reference)}`, { cache: "no-store", signal: AbortSignal.timeout(30000) });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.data) throw new Error(body?.error?.message || downloadError);
      await downloadTicket(body.data);
    } catch (cause) { setError(cause instanceof Error && !(cause instanceof TypeError) && cause.name !== "TimeoutError" && cause.name !== "AbortError" ? cause.message : downloadError); }
    finally { setBusy(false); }
  }
  return <article className="admission-ticket" aria-label={`Tiket ${ticket.eventTitle}`}>
    <header className="admission-ticket-header">
      <svg className="admission-ticket-cloud" viewBox="0 0 200 140" fill="none" aria-hidden="true"><path d="M20 110a30 30 0 0 1 8-59 49 49 0 0 1 93-13 36 36 0 1 1 30 72Z" stroke="currentColor" strokeWidth="2" /></svg>
      <div className="admission-ticket-brand"><span><Image src="/awan-event-logo.jpeg" alt="" width={32} height={32} /><strong>Awan Event</strong></span><span>{ticket.attendance === "ONSITE" ? "Tatap muka" : "Online"}</span></div>
      <p className="admission-ticket-kicker"><Ticket size={15} aria-hidden="true" />E-tiket {ticket.paid ? "berbayar" : "gratis"}</p>
      <h2>{ticket.eventTitle}</h2>
    </header>
    <div className="admission-ticket-details">
      <div className="admission-ticket-owner"><span>Nama peserta</span><strong>{ticket.participant}</strong><p>{ticket.ticketName}</p></div>
      <dl><div><dt>Tanggal</dt><dd>{schedule.date}</dd></div><div><dt>Waktu</dt><dd>{schedule.time}</dd></div><div><dt>{ticket.attendance === "ONSITE" ? "Lokasi" : "Pelaksanaan"}</dt><dd>{ticket.location}</dd></div></dl>
    </div>
    <div className="admission-ticket-stub"><div className="admission-ticket-qr"><TicketCode value={ticket.reference} /></div><div><span className="admission-ticket-status">{ticket.status}</span><strong className="admission-ticket-reference">{ticket.reference}</strong><p>{ticket.attendance === "ONSITE" ? "Tunjukkan QR ini saat check-in di lokasi." : "Simpan sebagai bukti keikutsertaan Anda."}</p></div></div>
    <footer className="admission-ticket-footer">
      {error && <p className="flow-alert danger" role="alert">{error}</p>}
      <button type="button" className="flow-button" disabled={busy} onClick={() => void download()} aria-label={`Unduh tiket ${ticket.eventTitle}`} aria-busy={busy}><Download size={17} aria-hidden="true" />{busy ? "Menyiapkan tiket…" : "Unduh tiket"}</button>
      <span role="status">{busy ? "Sedang menyiapkan gambar tiket." : "Format PNG, dapat disimpan di ponsel."}</span>
    </footer>
  </article>;
}

export function Tickets({ id }: { id?: string }) {
  const { state, ready, error, refresh } = usePlatform();
  if (!ready && !error) return <p role="status">Menyiapkan tiket…</p>;
  if (error) return <Panel title="Tiket belum dapat dimuat"><p role="alert">{error}</p><button className="flow-button secondary mt-4" onClick={() => void refresh()}>Muat ulang tiket</button></Panel>;
  const tickets = state.registrations.filter(registration => registration.email === state.session.email && (!id || registration.id === id)).flatMap(registration => {
    const event = state.events.find(item => item.slug === registration.eventSlug);
    const ticket = event && admissionTicket(registration, event);
    return ticket ? [ticket] : [];
  });
  return <div><PageHeading title={id ? "Detail tiket" : "Tiket saya"} description="Simpan e-tiket Anda untuk verifikasi keikutsertaan dan check-in." />
    {tickets.length ? <div className="workspace-card-grid admission-ticket-grid">{tickets.map(ticket => <TicketCard key={ticket.reference} ticket={ticket} />)}</div> : <Empty title={id ? "Tiket tidak tersedia" : "Belum ada e-tiket"} description="E-tiket tersedia untuk pendaftaran berbayar yang sudah lunas atau kehadiran tatap muka. Webinar gratis online dapat diakses melalui Kelas saya." />}
  </div>;
}

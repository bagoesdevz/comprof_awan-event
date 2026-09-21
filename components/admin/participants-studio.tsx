"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Download,
  Mail,
  Phone,
  Search,
  TicketCheck,
  Users,
  X,
} from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import { Badge, PageHeading, exportCsv } from "@/components/platform/ui";
import {
  money,
  nextAction,
  paymentLabels,
  type PaymentStatus,
  type Registration,
} from "@/lib/platform-model";

const progressLabels = [
  ["pre-test", "Pre-test"],
  ["attendance", "Kehadiran"],
  ["post-test", "Post-test"],
  ["feedback", "Feedback"],
] as const;

function paymentTone(status: PaymentStatus) {
  if (status === "paid") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "failed" || status === "expired") return "danger" as const;
  return "neutral" as const;
}

export function ParticipantsStudio() {
  const { state } = usePlatform();
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("all");
  const [eventSlug, setEventSlug] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const rows = useMemo(
    () =>
      state.registrations
        .map((registration) => ({
          registration,
          event: state.events.find((item) => item.slug === registration.eventSlug),
        }))
        .filter(({ registration, event }) => {
          const haystack = [
            registration.name,
            registration.email,
            registration.phone,
            registration.id,
            registration.ticketName,
            event?.title || registration.eventSlug,
          ]
            .join(" ")
            .toLowerCase();
          return (
            haystack.includes(query.trim().toLowerCase()) &&
            (payment === "all" || registration.payment === payment) &&
            (eventSlug === "all" || registration.eventSlug === eventSlug)
          );
        }),
    [eventSlug, payment, query, state.events, state.registrations],
  );

  const selected = selectedId
    ? state.registrations.find((item) => item.id === selectedId) || null
    : null;
  const selectedEvent = selected
    ? state.events.find((item) => item.slug === selected.eventSlug)
    : undefined;
  const paidCount = state.registrations.filter((item) => item.payment === "paid").length;
  const attendanceCount = state.registrations.filter((item) => item.progress.attendance).length;

  useEffect(() => {
    if (!selectedId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedId(null);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [selectedId]);

  function openDetail(registration: Registration, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setSelectedId(registration.id);
  }

  function downloadCsv() {
    exportCsv(
      "peserta-awan-event",
      ["ID", "Nama", "Email", "Telepon", "Event", "Tiket", "Pembayaran", "Nominal"],
      rows.map(({ registration, event }) => [
        registration.id,
        registration.name,
        registration.email,
        registration.phone,
        event?.title || registration.eventSlug,
        registration.ticketName,
        paymentLabels[registration.payment],
        registration.amount,
      ]),
    );
  }

  return (
    <div className="participants-studio mx-auto max-w-[1440px]">
      <PageHeading
        eyebrow="Operasional / Peserta"
        title="Peserta dan enrollment"
        description="Telusuri akun, event, tiket, pembayaran, dan progres peserta dari satu ruang kerja."
        action={
          <button type="button" className="flow-button secondary" onClick={downloadCsv}>
            <Download size={16} aria-hidden="true" />
            Ekspor CSV
          </button>
        }
      />

      <section className="participant-summary" aria-label="Ringkasan peserta">
        <article>
          <Users size={19} aria-hidden="true" />
          <span>Total pendaftar</span>
          <strong>{state.registrations.length}</strong>
        </article>
        <article>
          <CheckCircle2 size={19} aria-hidden="true" />
          <span>Pembayaran lunas</span>
          <strong>{paidCount}</strong>
        </article>
        <article>
          <TicketCheck size={19} aria-hidden="true" />
          <span>Kehadiran tercatat</span>
          <strong>{attendanceCount}</strong>
        </article>
      </section>

      <section className="participant-directory" aria-labelledby="participant-directory-title">
        <div className="participant-directory-head">
          <div>
            
            <h2 id="participant-directory-title">Daftar peserta</h2>
          </div>
          <Badge>{rows.length} data</Badge>
        </div>

        <div className="participant-filters">
          <label className="participant-search">
            <span className="sr-only">Cari peserta</span>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama, email, kode, atau event"
            />
          </label>
          <label>
            <span>Status pembayaran</span>
            <select value={payment} onChange={(event) => setPayment(event.target.value)}>
              <option value="all">Semua status</option>
              <option value="paid">Lunas</option>
              <option value="pending">Menunggu</option>
              <option value="failed">Gagal</option>
              <option value="expired">Kedaluwarsa</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="refunded">Dikembalikan</option>
            </select>
          </label>
          <label>
            <span>Event</span>
            <select value={eventSlug} onChange={(event) => setEventSlug(event.target.value)}>
              <option value="all">Semua event</option>
              {state.events.map((event) => (
                <option value={event.slug} key={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ul className="participant-list">
          {rows.map(({ registration, event }) => {
            const action = event ? nextAction(registration, event) : null;
            return (
              <li key={registration.id}>
                <div className="participant-identity">
                  <span aria-hidden="true">
                    {registration.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div>
                    <strong>{registration.name}</strong>
                    <small>{registration.email}</small>
                  </div>
                </div>
                <div className="participant-event-cell">
                  <strong>{event?.title || registration.eventSlug}</strong>
                  <small>{registration.ticketName}</small>
                </div>
                <div>
                  <Badge tone={paymentTone(registration.payment)}>
                    {paymentLabels[registration.payment]}
                  </Badge>
                  <small className="participant-amount">{money(registration.amount)}</small>
                </div>
                <div className="participant-next-action">
                  <small>Tindakan berikutnya</small>
                  <strong>{action?.label || "Tinjau data"}</strong>
                </div>
                <button
                  type="button"
                  className="participant-detail-button"
                  onClick={(clickEvent) => openDetail(registration, clickEvent.currentTarget)}
                  aria-label={`Lihat detail ${registration.name}`}
                >
                  Detail
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>

        {!rows.length && (
          <div className="participant-empty">
            <Search size={22} aria-hidden="true" />
            <h3>Peserta tidak ditemukan</h3>
            <p>Coba ubah kata kunci atau filter yang digunakan.</p>
          </div>
        )}
      </section>

      {selected && (
        <div className="participant-detail-backdrop" onMouseDown={() => setSelectedId(null)}>
          <aside
            ref={dialogRef}
            className="participant-detail-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="participant-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                
                <h2 id="participant-detail-title">{selected.name}</h2>
                <p>{selected.id}</p>
              </div>
              <button ref={closeRef} type="button" onClick={() => setSelectedId(null)} aria-label="Tutup detail peserta">
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            <div className="participant-detail-content">
              <section>
                <h3>Kontak peserta</h3>
                <dl>
                  <div>
                    <dt><Mail size={15} aria-hidden="true" /> Email</dt>
                    <dd>{selected.email}</dd>
                  </div>
                  <div>
                    <dt><Phone size={15} aria-hidden="true" /> WhatsApp</dt>
                    <dd>{selected.phone || "Belum tersedia"}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h3>Enrollment</h3>
                <dl>
                  <div><dt>Event</dt><dd>{selectedEvent?.title || selected.eventSlug}</dd></div>
                  <div><dt>Tiket</dt><dd>{selected.ticketName}</dd></div>
                  <div><dt>Kehadiran</dt><dd>{selected.attendance}</dd></div>
                  <div><dt>Terdaftar</dt><dd>{new Date(selected.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</dd></div>
                </dl>
              </section>

              <section>
                <div className="participant-detail-section-head">
                  <h3>Pembayaran</h3>
                  <Badge tone={paymentTone(selected.payment)}>{paymentLabels[selected.payment]}</Badge>
                </div>
                <dl>
                  <div><dt>Nominal</dt><dd>{money(selected.amount)}</dd></div>
                  <div><dt>Metode</dt><dd>{selected.method || "Belum dipilih"}</dd></div>
                  <div><dt>Biaya</dt><dd>{money(selected.fee)}</dd></div>
                </dl>
              </section>

              <section>
                <h3>Progres sertifikat</h3>
                <ul className="participant-progress-list">
                  {progressLabels.map(([key, label]) => (
                    <li key={key} className={selected.progress[key] ? "is-complete" : ""}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{label}</span>
                      <strong>{selected.progress[key] ? "Selesai" : "Belum"}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {selectedEvent && (
              <footer>
                <Link href={`/admin/events/${selectedEvent.slug}`}>
                  Buka event
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </footer>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

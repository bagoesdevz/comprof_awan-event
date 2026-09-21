"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  Download,
  Mail,
  MailCheck,
  RefreshCw,
  Search,
  Send,
  TriangleAlert,
  X,
} from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import type { Registration } from "@/lib/platform-model";

type EmailStatus = "all" | "sent" | "processing" | "waiting" | "failed";

const filters: { value: EmailStatus; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "sent", label: "Terkirim" },
  { value: "processing", label: "Diproses" },
  { value: "waiting", label: "Menunggu" },
  { value: "failed", label: "Gagal" },
];

const statusMeta = {
  sent: { label: "Terkirim", className: "bg-[#ECFDF5] text-[#087A55]", icon: CheckCircle2 },
  processing: { label: "Diproses", className: "bg-primary-100 text-primary-800", icon: RefreshCw },
  waiting: { label: "Menunggu", className: "bg-[#FFFBEB] text-[#A76108]", icon: Clock3 },
  failed: { label: "Gagal", className: "bg-[#FEF2F2] text-[#B42318]", icon: TriangleAlert },
} as const;

type CertRow = {
  id: string;
  participant: string;
  email: string;
  event: string;
  issuedAt: string;
  emailStatus: keyof typeof statusMeta;
  emailedAt: string | null;
  downloadCount: number;
  lastDownloadedAt: string | null;
  token: string;
};

function toCertRow(r: Registration, eventTitle: string): CertRow | null {
  if (!r.certificate) return null;
  const issued = r.certificate.issuedAt
    ? new Date(r.certificate.issuedAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  // Derive email status from payment + certificate status
  const emailStatus: keyof typeof statusMeta =
    r.certificate.status === "revoked"
      ? "failed"
      : r.payment !== "paid"
        ? "waiting"
        : "sent";
  return {
    id: r.certificate.number,
    participant: r.name,
    email: r.email,
    event: eventTitle,
    issuedAt: issued,
    emailStatus,
    emailedAt: r.paidAt
      ? new Date(r.paidAt).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null,
    downloadCount: 0,
    lastDownloadedAt: null,
    token: r.certificate.token,
  };
}

export function CertificateMonitoring() {
  const { state, ready } = usePlatform();
  const [statusFilter, setStatusFilter] = useState<EmailStatus>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const eventTitles = useMemo(() => {
    const map: Record<string, string> = {};
    for (const e of state.events) map[e.slug] = e.title;
    return map;
  }, [state.events]);

  const certRows = useMemo<CertRow[]>(() => {
    const rows: CertRow[] = [];
    for (const r of state.registrations) {
      if (!r.certificate) continue;
      const row = toCertRow(r, eventTitles[r.eventSlug] ?? r.eventSlug);
      if (row) rows.push(row);
    }
    return rows;
  }, [state.registrations, eventTitles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("id-ID");
    return certRows.filter((c) => {
      const matchStatus = statusFilter === "all" || c.emailStatus === statusFilter;
      const matchQuery =
        !q ||
        [c.id, c.participant, c.email, c.event].some((v) =>
          v.toLocaleLowerCase("id-ID").includes(q),
        );
      return matchStatus && matchQuery;
    });
  }, [certRows, query, statusFilter]);

  const sentCount = certRows.filter((c) => c.emailStatus === "sent").length;
  const downloadedCount = certRows.filter((c) => c.downloadCount > 0).length;
  const attentionCount = certRows.filter(
    (c) => c.emailStatus === "failed" || c.emailStatus === "waiting",
  ).length;

  const selectedCert = selectedId ? certRows.find((c) => c.id === selectedId) ?? null : null;

  useEffect(() => {
    if (!selectedId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSelectedId(null); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])",
        ),
      );
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = prev; triggerRef.current?.focus(); };
  }, [selectedId]);

  if (!ready) return null;

  return (
    <>
      <section
        className="grid gap-px overflow-hidden rounded-[24px_24px_24px_6px] border border-content-title/10 bg-content-title/10 sm:grid-cols-3"
        aria-label="Ringkasan sertifikat"
      >
        <article className="bg-white p-5 sm:p-6">
          <MailCheck className="h-5 w-5 text-[#087A55]" aria-hidden="true" />
          <span className="mt-5 detail-label">Email terkirim</span>
          <strong className="text-3xl font-semibold tracking-[-0.04em]">{sentCount}</strong>
          <p className="mt-2 text-xs text-content-muted">
            Dari {certRows.length} sertifikat terdaftar
          </p>
        </article>
        <article className="bg-white p-5 sm:p-6">
          <Download className="h-5 w-5 text-primary-600" aria-hidden="true" />
          <span className="mt-5 detail-label">Sudah diunduh</span>
          <strong className="text-3xl font-semibold tracking-[-0.04em]">{downloadedCount}</strong>
          <p className="mt-2 text-xs text-content-muted">Peserta telah membuka sertifikat</p>
        </article>
        <article className="bg-primary-950 p-5 text-white sm:p-6">
          <TriangleAlert className="h-5 w-5 text-primary-400" aria-hidden="true" />
          <span className="mt-5 mb-2 block font-mono text-[9px] uppercase tracking-[0.12em] text-primary-400">
            Perlu ditindaklanjuti
          </span>
          <strong className="text-3xl font-semibold tracking-[-0.04em]">{attentionCount}</strong>
          <p className="mt-2 text-xs text-white/55">Menunggu kelayakan atau email gagal</p>
        </article>
      </section>

      <section
        className="mt-6 overflow-hidden rounded-[26px_26px_26px_7px] border border-content-title/10 bg-white shadow-diffusion"
        aria-labelledby="cert-monitor-title"
      >
        <div className="border-b border-content-title/10 p-5 sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 id="cert-monitor-title" className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
                Status penerbitan &amp; pengiriman
              </h2>
            </div>
            <label className="relative block w-full xl:max-w-sm">
              <span className="sr-only">Cari sertifikat</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari peserta, email, event, atau nomor"
                className="min-h-12 w-full rounded-full border border-content-title/10 bg-surface-muted py-3 pl-11 pr-4 text-sm outline-none placeholder:text-content-muted focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </label>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Filter status">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={statusFilter === f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`min-h-11 shrink-0 cursor-pointer rounded-full px-4 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                  statusFilter === f.value
                    ? "bg-primary-950 text-white"
                    : "border border-content-title/10 bg-white text-content-body hover:bg-primary-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {certRows.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-100 text-primary-700">
                <Award className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Belum ada sertifikat</h3>
              <p className="mt-2 text-sm text-content-muted">
                Sertifikat akan muncul setelah peserta memenuhi persyaratan event.
              </p>
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-surface-muted font-mono text-[9px] uppercase tracking-[0.1em] text-content-muted">
                <tr>
                  <th className="px-5 py-4 font-medium sm:px-7">Peserta</th>
                  <th className="px-5 py-4 font-medium">Event</th>
                  <th className="px-5 py-4 font-medium">Sertifikat</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 text-right font-medium sm:px-7">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-content-title/10">
                {filtered.map((cert) => {
                  const meta = statusMeta[cert.emailStatus];
                  const StatusIcon = meta.icon;
                  return (
                    <tr key={cert.id} className="transition hover:bg-surface-muted/70">
                      <td className="px-5 py-5 sm:px-7">
                        <strong className="block text-sm">{cert.participant}</strong>
                        <span className="mt-1 block text-xs text-content-muted">{cert.email}</span>
                      </td>
                      <td className="px-5 py-5">
                        <span className="block max-w-[240px] text-xs font-semibold leading-5">{cert.event}</span>
                      </td>
                      <td className="px-5 py-5">
                        <span className="block font-mono text-[10px] font-semibold">{cert.id}</span>
                        <span className="mt-1 block text-xs text-content-muted">{cert.issuedAt}</span>
                      </td>
                      <td className="px-5 py-5">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-semibold ${meta.className}`}>
                          <StatusIcon
                            className={`h-3.5 w-3.5 ${cert.emailStatus === "processing" ? "animate-spin motion-reduce:animate-none" : ""}`}
                            aria-hidden="true"
                          />
                          {meta.label}
                        </span>
                        {cert.emailedAt && (
                          <span className="mt-2 block text-[10px] text-content-muted">{cert.emailedAt}</span>
                        )}
                      </td>
                      <td className="px-5 py-5 text-right sm:px-7">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`/api/certificates/${encodeURIComponent(cert.token)}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-content-title/10 px-4 text-xs font-semibold transition hover:bg-primary-100"
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Unduh
                          </a>
                          <button
                            type="button"
                            className="payment-detail-button"
                            aria-label={`Detail ${cert.id}`}
                            onClick={(e) => { triggerRef.current = e.currentTarget; setSelectedId(cert.id); }}
                          >
                            Detail <ArrowRight size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-100 text-primary-700">
                <Award className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Tidak ditemukan</h3>
              <p className="mt-2 text-sm text-content-muted">Ubah kata pencarian atau pilih status lain.</p>
            </div>
          </div>
        )}
      </section>

      {selectedCert && (() => {
        const meta = statusMeta[selectedCert.emailStatus];
        const StatusIcon = meta.icon;
        return (
          <div className="participant-detail-backdrop" onMouseDown={() => setSelectedId(null)}>
            <aside
              ref={dialogRef}
              className="participant-detail-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cert-detail-title"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <header>
                <div>
                  <h2 id="cert-detail-title">{selectedCert.id}</h2>
                  <p>{selectedCert.issuedAt}</p>
                </div>
                <button ref={closeRef} type="button" onClick={() => setSelectedId(null)} aria-label="Tutup detail">
                  <X size={20} aria-hidden="true" />
                </button>
              </header>

              <div className="participant-detail-content">
                <section className="certificate-detail-hero">
                  <span><Award size={28} aria-hidden="true" /></span>
                  <div>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-semibold ${meta.className}`}>
                      <StatusIcon
                        className={`h-3.5 w-3.5 ${selectedCert.emailStatus === "processing" ? "animate-spin motion-reduce:animate-none" : ""}`}
                        aria-hidden="true"
                      />
                      {meta.label}
                    </span>
                    <h3>{selectedCert.participant}</h3>
                    <p>{selectedCert.event}</p>
                  </div>
                </section>

                <section>
                  <h3>Informasi penerbitan</h3>
                  <dl>
                    <div><dt>Nomor sertifikat</dt><dd>{selectedCert.id}</dd></div>
                    <div><dt>Diterbitkan</dt><dd>{selectedCert.issuedAt}</dd></div>
                  </dl>
                </section>

                <section>
                  <h3>Peserta</h3>
                  <dl>
                    <div><dt>Nama</dt><dd>{selectedCert.participant}</dd></div>
                    <div><dt><Mail size={15} aria-hidden="true" /> Email</dt><dd>{selectedCert.email}</dd></div>
                    <div><dt>Event</dt><dd>{selectedCert.event}</dd></div>
                  </dl>
                </section>

                <section>
                  <h3>Distribusi</h3>
                  <dl>
                    <div><dt>Status email</dt><dd>{meta.label}</dd></div>
                    <div><dt>Waktu kirim</dt><dd>{selectedCert.emailedAt ?? "Belum tersedia"}</dd></div>
                    <div><dt>Total unduhan</dt><dd>{selectedCert.downloadCount} kali</dd></div>
                    <div><dt>Unduhan terakhir</dt><dd>{selectedCert.lastDownloadedAt ?? "Belum diunduh"}</dd></div>
                  </dl>
                </section>

                <div className="mt-6">
                  <a
                    href={`/api/certificates/${encodeURIComponent(selectedCert.token)}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flow-button w-full text-center"
                  >
                    <Download size={16} aria-hidden="true" /> Unduh sertifikat
                  </a>
                </div>
              </div>

              <footer>
                <button type="button" className="participant-detail-close-action" onClick={() => setSelectedId(null)}>
                  Tutup detail
                </button>
              </footer>
            </aside>
          </div>
        );
      })()}
    </>
  );
}

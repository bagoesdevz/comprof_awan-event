"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Award, ShieldCheck, ShieldX } from "lucide-react";
import { usePlatform } from "./provider";
import { Badge, Empty, Field, Panel } from "./ui";
import { eligible, certificateNameVerified, certificateRecipientName, type Registration } from "@/lib/platform-model";

function CertificateNameForm({ registration }: { registration: Registration }) {
  const { action, saving, error } = usePlatform();
  const [name, setName] = useState(registration.name);
  const [confirmed, setConfirmed] = useState(false);
  const [failed, setFailed] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !confirmed) return;
    setFailed(false);
    const result = await action({ type: "confirm-certificate-name", id: registration.id, name, confirmed: true });
    if (!result) setFailed(true);
  }
  return <form onSubmit={submit} className="mt-6 grid gap-5">
    <Field label="Nama pada sertifikat" hint="Perbaiki ejaan atau gelar bila diperlukan. Perubahan ini hanya berlaku untuk sertifikat event ini.">
      <input name="certificateName" autoComplete="name" value={name} onChange={event => { setName(event.target.value); setConfirmed(false); setFailed(false); }} required minLength={2} maxLength={160} disabled={saving} />
    </Field>
    <p className="text-sm leading-6 text-content-muted">Pastikan nama sudah benar. Nama tidak dapat diedit dari halaman ini setelah dikonfirmasi.</p>
    <label className="flex min-h-11 items-start gap-3 text-sm leading-6"><input className="mt-1 h-4 w-4 shrink-0" type="checkbox" checked={confirmed} onChange={event => { setConfirmed(event.target.checked); setFailed(false); }} required disabled={saving} /><span>Nama di atas sudah benar untuk dicetak pada sertifikat.</span></label>
    {failed && <p role="alert" className="flow-alert danger">{error || "Nama belum dapat dikonfirmasi. Silakan coba lagi."}</p>}
    <button type="submit" className="flow-button w-fit" disabled={saving || !confirmed || name.trim().length < 2}>{saving ? "Menyimpan…" : "Konfirmasi nama"}</button>
  </form>;
}

export function CertificatePanel({ registration }: { registration: Registration }) {
  const { state, refresh } = usePlatform();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const event = state.events.find((e) => e.slug === registration.eventSlug);
  const cert = registration.certificate;
  if (!event?.certificateEnabled && !cert) return <Panel title={event?.title ?? registration.eventSlug}><p className="text-sm text-content-muted">Event ini tidak menyediakan sertifikat.</p></Panel>;

  const verified = certificateNameVerified(registration);
  if (event && event.certificateEnabled && eligible(registration, event) && !verified && cert?.status !== "revoked") return <Panel>
    <h2 className="text-2xl font-semibold">Verifikasi nama sertifikat</h2>
    <p className="mt-2 break-words text-sm leading-6 text-content-muted">Evaluasi kegiatan sudah tersimpan. Periksa nama untuk {event.title} sebelum mengunduh sertifikat.</p>
    <CertificateNameForm key={registration.id} registration={registration} />
  </Panel>;

  async function download() {
    if (!cert || !canDownload || downloading) return;
    setDownloading(true); setDownloadError("");
    try {
      const response = await fetch(`/api/certificates/${cert.token}/download`, { cache: "no-store", signal: AbortSignal.timeout(30000) });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : body.error?.message || "Sertifikat belum dapat diunduh.");
      }
      if (!response.headers.get("Content-Type")?.includes("image/svg+xml")) throw new Error("File sertifikat belum tersedia. Silakan coba lagi.");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = cert.number.replace(/[\\/:*?"<>|]/g, "_") + ".svg"; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) { setDownloadError(cause instanceof Error && !["TimeoutError", "TypeError"].includes(cause.name) ? cause.message : "Sertifikat belum dapat diunduh. Periksa koneksi dan coba lagi."); }
    finally { setDownloading(false); }
  }

  const canDownload = !!cert && cert.status === "valid" && verified && !!event?.certificateEnabled && eligible(registration, event);

  return (
    <Panel>
      <Award size={34} className="text-primary-600" />
      <h2 className="mt-5 break-words text-2xl font-semibold">{event?.title ?? registration.eventSlug}</h2>
      <p className="my-3 break-words text-sm text-content-muted">{certificateRecipientName(registration)}</p>
      {verified && <p role="status" className="mb-4 text-sm text-content-muted">Nama sertifikat sudah terverifikasi.</p>}
      {downloadError && <p className="flow-alert danger mb-4" role="alert">{downloadError}</p>}
      {cert ? (
        <>
          <Badge tone={cert.status === "valid" ? "success" : "danger"}>
            {cert.status === "valid" ? "Terbit" : "Dicabut"}
          </Badge>
          <p className="mt-4 break-all font-mono text-xs">{cert.number}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={!canDownload || downloading}
              className="flow-button"
              onClick={download}
              title={canDownload ? "Unduh sertifikat SVG" : cert.status === "revoked" ? "Sertifikat dicabut" : "Persyaratan belum terpenuhi"}
            >
              {downloading ? "Menyiapkan unduhan…" : "Unduh sertifikat"}
            </button>
            <Link className="flow-button secondary" href={`/verify/${cert.token}`}>
              Lihat verifikasi publik
            </Link>
          </div>
        </>
      ) : (
        <>
          <Badge tone="warning">{event && eligible(registration, event) ? "Sedang disiapkan" : "Belum memenuhi syarat"}</Badge>
          <p className="my-4 text-sm leading-6 text-content-muted">
            {event && eligible(registration, event) ? "Nama sudah dikonfirmasi. Sertifikat belum tersedia; periksa kembali setelah disiapkan oleh penyelenggara." : "Lengkapi aktivitas yang diwajibkan untuk memperoleh sertifikat."}
          </p>
          {event && (
            <Link className="flow-button secondary" href={`/dashboard/events/${event.slug}`}>
              Lihat aktivitas
            </Link>
          )}
          {verified && <button type="button" className="flow-button secondary mt-3" onClick={() => void refresh()}>Muat ulang sertifikat</button>}
        </>
      )}
    </Panel>
  );
}

export function Certificates() {
  const { state, ready } = usePlatform();
  const rows = state.registrations.filter(
    (r) => r.email === state.session.email && r.payment === "paid",
  );
  if (!ready) return null;
  return (
    <>
      <div className="workspace-card-grid mt-8 grid gap-5 lg:grid-cols-2">
        {rows.map((r) => (
          <CertificatePanel key={r.id} registration={r} />
        ))}
      </div>
      {!rows.length && <Empty title="Belum ada sertifikat" href="/events" />}
    </>
  );
}

// ---------- Verifikasi publik — fetch langsung ke API, tidak bergantung state ----------

type VerifyResult =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "error"; message: string }
  | { status: "found"; valid: boolean; data: Record<string, string> };

export function Verification({ token }: { token: string }) {
  const [result, setResult] = useState<VerifyResult>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/certificates/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (r) => {
        const body = await r.json();
        if (cancelled) return;
        if (!r.ok) {
          if (r.status === 404) setResult({ status: "not_found" });
          else setResult({ status: "error", message: body?.error?.message ?? "Gagal memeriksa sertifikat." });
          return;
        }
        const d = body.data;
        const valid = d.status === "valid";
        setResult({
          status: "found",
          valid,
          data: {
            "Nama peserta": d.participantName ?? "-",
            Program: d.eventTitle ?? "-",
            Penerbit: "Awan Event",
            "Nomor sertifikat": d.certificateNumber ?? "-",
            "Tanggal terbit": d.issuedAt ? new Date(d.issuedAt).toLocaleDateString("id-ID") : "-",
            Status: valid ? "Valid" : "Dicabut",
          },
        });
      })
      .catch(() => {
        if (!cancelled)
          setResult({ status: "error", message: "Tidak dapat terhubung ke layanan verifikasi." });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const Icon =
    result.status === "found" && result.valid
      ? ShieldCheck
      : result.status === "loading"
        ? Award
        : ShieldX;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Panel>
        <Icon
          size={48}
          className={
            result.status === "found" && result.valid
              ? "text-primary-600"
              : result.status === "loading"
                ? "text-content-muted animate-pulse"
                : "text-content-muted"
          }
        />
        {result.status === "loading" && (
          <p role="status" className="mt-6 text-sm text-content-muted">
            Memeriksa sertifikat…
          </p>
        )}
        {result.status === "not_found" && (
          <>
            <Badge tone="danger">Tidak ditemukan</Badge>
            <h1 className="my-6 text-4xl font-semibold tracking-tight">Sertifikat tidak ditemukan.</h1>
            <p className="text-sm text-content-muted">Periksa kembali nomor atau tautan verifikasi yang diberikan.</p>
          </>
        )}
        {result.status === "error" && (
          <>
            <Badge tone="warning">Tidak dapat diperiksa</Badge>
            <h1 className="my-6 text-4xl font-semibold tracking-tight">Layanan belum tersedia.</h1>
            <p className="text-sm text-content-muted">{result.message}</p>
          </>
        )}
        {result.status === "found" && (
          <>
            <Badge tone={result.valid ? "success" : "danger"}>{result.valid ? "Valid" : "Dicabut"}</Badge>
            <h1 className="my-6 text-4xl font-semibold tracking-tight">
              {result.valid ? "Pencapaian yang terverifikasi." : "Sertifikat telah dicabut."}
            </h1>
            <dl className="grid gap-5 sm:grid-cols-2">
              {Object.entries(result.data).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-content-muted">{label}</dt>
                  <dd className="mt-2 break-words font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        <Link className="flow-button mt-7" href="/">
          Kembali ke Awan Event
        </Link>
      </Panel>
    </div>
  );
}

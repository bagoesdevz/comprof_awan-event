"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ShieldCheck, ShieldX } from "lucide-react";
import { usePlatform } from "./provider";
import { Badge, Empty, Panel } from "./ui";
import { eligible, type Registration } from "@/lib/platform-model";

export function CertificatePanel({ registration }: { registration: Registration }) {
  const { state } = usePlatform();
  const event = state.events.find((e) => e.slug === registration.eventSlug);
  const cert = registration.certificate;

  function download() {
    if (!cert || cert.status !== "valid") return;
    // Download dilakukan server-side — template, escape, dan eligibility diperiksa ulang di server
    window.open(`/api/certificates/${cert.token}/download`, "_blank", "noopener");
  }

  const canDownload = !!cert && cert.status === "valid" && !!event && eligible(registration, event);

  return (
    <Panel>
      <Award size={34} className="text-primary-600" />
      <h2 className="mt-5 text-2xl font-semibold">{event?.title ?? registration.eventSlug}</h2>
      <p className="my-3 text-sm text-content-muted">{registration.name}</p>
      {cert ? (
        <>
          <Badge tone={cert.status === "valid" ? "success" : "danger"}>
            {cert.status === "valid" ? "Terbit" : "Dicabut"}
          </Badge>
          <p className="mt-4 break-all font-mono text-xs">{cert.number}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={!canDownload}
              className="flow-button"
              onClick={download}
              title={canDownload ? "Unduh sertifikat SVG" : "Persyaratan belum terpenuhi"}
            >
              Unduh sertifikat
            </button>
            <Link className="flow-button secondary" href={`/verify/${cert.token}`}>
              Verifikasi
            </Link>
          </div>
        </>
      ) : (
        <>
          <Badge tone="warning">Belum memenuhi syarat</Badge>
          <p className="my-4 text-sm leading-6 text-content-muted">
            Lengkapi aktivitas yang diwajibkan untuk menerbitkan sertifikat.
          </p>
          {event && (
            <Link className="flow-button secondary" href={`/dashboard/events/${event.slug}`}>
              Lihat aktivitas
            </Link>
          )}
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
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
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

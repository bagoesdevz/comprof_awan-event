"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Copy, Download, QrCode } from "lucide-react";
import { publicEventLink } from "@/lib/event-sharing";
import type { ManagedEvent } from "@/lib/platform-model";
import { Field } from "@/components/platform/ui";
import { usePlatform } from "@/components/platform/provider";

const qrOptions = { margin: 4, errorCorrectionLevel: "M" as const, color: { dark: "#000000", light: "#ffffff" } };

export function EventQrCode({ event }: { event?: ManagedEvent }) {
  const { action, saving } = usePlatform();
  const url = event?.publication === "published" ? publicEventLink(event) : "";
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    let active = true;
    setImage(""); setError(""); setNotice("");
    if (url) QRCode.toDataURL(url, { ...qrOptions, width: 2048 }).then(value => {
      if (active) setImage(value);
    }).catch(() => { if (active) setError("QR belum dapat dibuat. Coba lagi."); });
    return () => { active = false; };
  }, [url, retry]);

  function download(href: string, extension: string) {
    const anchor = document.createElement("a");
    anchor.href = href; anchor.download = `qr-event-${event?.publicCode}.${extension}`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
  }
  async function downloadSvg() {
    if (!url) return;
    setDownloading(true); setNotice("");
    try {
      const svg = await QRCode.toString(url, { ...qrOptions, type: "svg" });
      const objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      download(objectUrl, "svg"); setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch { setNotice("SVG belum dapat diunduh. Coba lagi atau gunakan PNG."); }
    finally { setDownloading(false); }
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(url); setNotice("Tautan event disalin."); }
    catch { setNotice("Tautan belum dapat disalin otomatis. Pilih dan salin dari kolom tautan event."); }
  }

  return <section className="event-share-panel flow-panel mt-6" aria-labelledby="event-qr-heading">
    <div className="event-share-copy">
      <h2 id="event-qr-heading"><QrCode size={22} aria-hidden="true" />QR Code untuk flyer</h2>
      <p>Pindai QR untuk membuka halaman event. Unduh PNG 2048 × 2048 px atau SVG untuk desain cetak.</p>
      {url ? <>
        <Field label="Tautan event"><input readOnly value={url} onFocus={event => event.currentTarget.select()} /></Field>
        <div className="event-share-actions">
          <button type="button" className="flow-button" disabled={!image} onClick={() => { download(image, "png"); setNotice("PNG diunduh."); }}><Download size={16} aria-hidden="true" />Unduh PNG</button>
          <button type="button" className="flow-button secondary" disabled={!image || downloading} onClick={() => void downloadSvg()}>{downloading ? "Menyiapkan SVG…" : "Unduh SVG"}</button>
          <button type="button" className="flow-button secondary" onClick={() => void copyLink()}><Copy size={16} aria-hidden="true" />Salin tautan</button>
        </div>
        <p className="event-share-note">Pertahankan tepi putih QR saat menaruhnya di flyer. QR ini menuju halaman event, bukan tiket check-in peserta.</p>
        {notice && <p role="status" className="text-sm text-content-body">{notice}</p>}
      </> : event?.publication === "published" ? <div><p className="event-share-status">Tautan publik event belum dibuat.</p><button type="button" className="flow-button mt-3" disabled={saving} onClick={() => void action({ type: "ensure-event-links" })}>{saving ? "Membuat tautan…" : "Buat tautan event"}</button></div> : <p className="event-share-status">Simpan dan terbitkan event untuk membuat QR dari tautan yang dapat dibuka peserta.</p>}
    </div>
    {url && <div className="event-share-preview">
      {image ? <Image src={image} alt={`QR halaman event ${event?.title}`} unoptimized width={2048} height={2048} /> : error ? <div><p role="alert">{error}</p><button type="button" className="flow-button secondary mt-3" onClick={() => setRetry(value => value + 1)}>Buat ulang QR</button></div> : <p role="status">Menyiapkan QR event…</p>}
    </div>}
  </section>;
}

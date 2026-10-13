import "server-only";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { HttpError } from "./http";

const maxBytes = 5 * 1024 * 1024;

function imageMime(bytes: Buffer) {
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (bytes.subarray(0,4).toString() === "RIFF" && bytes.subarray(8,12).toString() === "WEBP") return "image/webp";
  throw new HttpError(422, "Template harus berupa PNG, JPEG, atau WebP.");
}

export async function certificateTemplateData(raw: string) {
  if (!raw) throw new HttpError(409, "Template sertifikat belum tersedia.");
  let bytes: Buffer;
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    const root = resolve(process.cwd(), "public");
    const filename = resolve(root, "." + decodeURIComponent(raw));
    if (!filename.startsWith(root + sep) || raw.includes("\\")) throw new HttpError(422, "Template tidak valid.");
    try { bytes = await readFile(filename); } catch { throw new HttpError(503, "Template belum dapat dimuat."); }
  } else {
    const storage = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!storage) throw new HttpError(503, "Penyimpanan template belum dikonfigurasi.");
    let url: URL;
    try { url = new URL(raw); } catch { throw new HttpError(422, "Template tidak valid."); }
    if (url.protocol !== "https:" || url.origin !== new URL(storage).origin || url.username || url.password || !url.pathname.startsWith("/storage/v1/object/public/event-assets/")) {
      throw new HttpError(422, "Gunakan template dari penyimpanan aplikasi.");
    }
    const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(15000), cache: "no-store" });
    if (!response.ok || !response.body) throw new HttpError(503, "Template belum dapat dimuat.");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const {done,value} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) { await reader.cancel(); throw new HttpError(413, "Template terlalu besar."); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    bytes = Buffer.concat(chunks);
  }
  if (bytes.length > maxBytes) throw new HttpError(413, "Template terlalu besar.");
  return `data:${imageMime(bytes)};base64,${bytes.toString("base64")}`;
}

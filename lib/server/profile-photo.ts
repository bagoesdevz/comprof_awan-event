import "server-only";
import sharp from "sharp";
import { HttpError } from "./http";

export const profilePhotoMaxBytes = 5 * 1024 * 1024;

export async function prepareProfilePhoto(bytes: Uint8Array) {
  const png = Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = Buffer.from(bytes.subarray(0, 4)).toString() === "RIFF" && Buffer.from(bytes.subarray(8, 12)).toString() === "WEBP";
  if (!bytes.length || bytes.length > profilePhotoMaxBytes || (!png && !jpeg && !webp)) throw new HttpError(422, "Gunakan foto PNG, JPG, atau WebP maksimal 5 MB.");
  try {
    return await sharp(bytes, { limitInputPixels: 25_000_000, animated: false, failOn: "warning" })
      .rotate().resize(512, 512, { fit: "cover", position: "centre" }).webp({ quality: 85 }).toBuffer();
  } catch { throw new HttpError(422, "Foto tidak dapat dibaca. Pilih gambar lain dengan ukuran maksimal 25 megapiksel."); }
}

export function isOwnProfilePhoto(raw: string, userId: string) {
  if (!raw) return true;
  const storage = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!storage) return false;
  try {
    const url = new URL(raw);
    const prefix = `/storage/v1/object/public/event-assets/avatars/${encodeURIComponent(userId)}/`;
    return url.protocol === "https:" && url.origin === new URL(storage).origin && !url.username && !url.password
      && !url.search && !url.hash && url.pathname.startsWith(prefix)
      && /^[0-9a-f-]{36}\.webp$/.test(url.pathname.slice(prefix.length));
  } catch { return false; }
}

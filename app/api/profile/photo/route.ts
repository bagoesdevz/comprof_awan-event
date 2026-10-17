import { currentUser } from "@/lib/supabase/auth";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/server/platform";
import { sameOrigin, readBytes, fail, json, rateLimit, HttpError } from "@/lib/server/http";
import { prepareProfilePhoto, profilePhotoMaxBytes } from "@/lib/server/profile-photo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = requireUser(await currentUser());
    await rateLimit("profile-photo:" + user.id, 10, 60);
    const body = await readBytes(request, profilePhotoMaxBytes + 65536);
    let form: FormData;
    try { form = await new Response(new Uint8Array(body), { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData(); }
    catch { throw new HttpError(422, "Pilih foto yang ingin diunggah."); }
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(422, "Pilih foto yang ingin diunggah.");
    const bytes = await prepareProfilePhoto(new Uint8Array(await file.arrayBuffer()));
    const path = `avatars/${user.id}/${crypto.randomUUID()}.webp`;
    const client = getServiceSupabaseClient();
    const { error } = await client.storage.from("event-assets").upload(path, bytes, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
    if (error) throw new HttpError(503, "Foto belum terunggah. Coba simpan profil lagi.");
    return json({ url: client.storage.from("event-assets").getPublicUrl(path).data.publicUrl }, 201);
  } catch (error) { return fail(error); }
}

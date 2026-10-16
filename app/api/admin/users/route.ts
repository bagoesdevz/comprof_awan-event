import { z } from "zod";
import type { User } from "@supabase/supabase-js";
import { currentUser } from "@/lib/supabase/auth";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, roleOf } from "@/lib/server/platform";
import { sameOrigin, readBody, fail, json, rateLimit, HttpError } from "@/lib/server/http";
import { authEmailRedirectUrl } from "@/lib/auth-redirect";

const roleSchema = z.enum(["participant", "operational", "super"]);
const pageSize = 50;
function account(user: User) {
  return { id: user.id, email: user.email || "", name: String(user.user_metadata?.name || user.user_metadata?.full_name || ""), role: roleOf(user) };
}

export async function GET(request: Request) {
  try {
    const admin = requireAdmin(await currentUser(), true);
    const page = z.coerce.number().int().min(1).max(100000).parse(new URL(request.url).searchParams.get("page") || 1);
    const { data, error } = await getServiceSupabaseClient().auth.admin.listUsers({ page, perPage: pageSize });
    if (error) throw error;
    const hasNext = data.total > 0 ? page * pageSize < data.total : data.users.length === pageSize;
    return json({ users: data.users.map(account), currentUserId: admin.id, page, hasNext });
  } catch (error) { return fail(error); }
}

export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const admin = requireAdmin(await currentUser(), true);
    await rateLimit("user-role:" + admin.id, 20);
    const input = z.object({ userId: z.uuid(), role: roleSchema }).strict().parse(await readBody(request, 5000));
    if (input.userId === admin.id) throw new HttpError(403, "Peran akun sendiri tidak dapat diubah di sini.");
    const client = getServiceSupabaseClient();
    const { data: target, error: targetError } = await client.auth.admin.getUserById(input.userId);
    if (targetError) {
      if (targetError.status === 404) throw new HttpError(404, "Akun tidak ditemukan.");
      throw targetError;
    }
    if (!target.user) throw new HttpError(404, "Akun tidak ditemukan.");
    if (roleOf(target.user) === input.role) return json({ user: account(target.user) });
    const { data, error } = await client.auth.admin.updateUserById(input.userId, {
      app_metadata: { ...target.user.app_metadata, role: input.role },
    });
    if (error) throw error;
    if (!data.user) throw new Error("Role update returned no user");
    return json({ user: account(data.user) });
  } catch (error) { return fail(error); }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const admin = requireAdmin(await currentUser(), true);
    await rateLimit("invite:" + admin.id, 10);
    const input = z.object({ email: z.string().email(), role: roleSchema }).parse(await readBody(request, 5000));
    const client = getServiceSupabaseClient();
    const { data, error } = await client.auth.admin.inviteUserByEmail(input.email, { redirectTo: authEmailRedirectUrl("invite") });
    if (error) throw error;
    const result = await client.auth.admin.updateUserById(data.user.id, { app_metadata: { ...data.user.app_metadata, role: input.role } });
    if (result.error) throw result.error;
    return json({ ok: true }, 201);
  } catch (error) { return fail(error); }
}

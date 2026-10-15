import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase/auth";
import { AUTH_SITE_URL, authCallbackDestination, isPasswordRecovery } from "@/lib/auth-redirect";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code"), token = url.searchParams.get("token_hash"), type = url.searchParams.get("type");
  const next = url.searchParams.get("next");
  const recovery = isPasswordRecovery(type, next);
  function redirect(path: string) {
    const response = NextResponse.redirect(new URL(path, AUTH_SITE_URL), 303);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }
  const invalid = () => redirect(recovery ? "/forgot-password?error=recovery" : "/login?error=confirmation");
  if (url.searchParams.has("error") || (!code && !token)) return invalid();
  try {
    const client = await sessionClient();
    let verified = false;
    if (token && (type === "email" || type === "signup" || type === "recovery" || type === "invite")) {
      const { error } = await client.auth.verifyOtp({ token_hash: token, type });
      verified = !error;
    } else if (code) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (error && ["bad_code_verifier", "flow_state_not_found", "flow_state_expired", "pkce_code_verifier_not_found", "pkce_verifier_not_found", "pkce_verifier_invalid"].includes(error.code || "")) {
        return redirect(recovery ? "/forgot-password?error=browser" : "/login?error=browser");
      }
      verified = !error;
    }
    if (!verified) return invalid();
    if (!recovery) {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) return redirect("/login?confirmed=1");
    }
    return redirect(authCallbackDestination(type, next));
  } catch {
    return redirect(recovery ? "/forgot-password?error=service" : "/login?error=service");
  }
}

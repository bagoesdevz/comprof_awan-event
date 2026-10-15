export const AUTH_SITE_URL = "https://awanevent.com";

export type EmailAuthType = "signup" | "email" | "recovery" | "invite";

export function authEmailRedirectUrl(type: EmailAuthType) {
  const url = new URL("/auth/callback", AUTH_SITE_URL);
  url.searchParams.set("type", type);
  return url.href;
}

export function isPasswordRecovery(type: string | null, next: string | null) {
  return type === "recovery" || type === "invite" || next === "/reset-password";
}

export function authCallbackDestination(type: string | null, next: string | null) {
  return isPasswordRecovery(type, next) ? "/reset-password" : "/login?confirmed=1";
}

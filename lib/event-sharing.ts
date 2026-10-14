export function whatsappGroupLink(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname !== "chat.whatsapp.com" || url.port || url.username || url.password || !/^\/[A-Za-z0-9]+\/?$/.test(url.pathname)) return "";
    url.hash = "";
    return url.toString();
  } catch { return ""; }
}

export function isEventPublicCode(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{32}$/.test(value);
}

export function eventPublicPath(event: { publicCode?: string; slug: string }) {
  return isEventPublicCode(event.publicCode) ? `/e/${event.publicCode}` : `/events/${encodeURIComponent(event.slug)}`;
}

export function publicEventLink(event: { publicCode?: string }) {
  return isEventPublicCode(event.publicCode) ? `https://awanevent.com/e/${event.publicCode}` : "";
}

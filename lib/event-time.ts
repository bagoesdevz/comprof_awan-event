const EVENT_TIME_ZONE = "Asia/Jakarta";

function dateParts(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
}

export function toWibDateTimeLocal(value?: string) {
  if (!value) return "";
  const parts = dateParts(value);
  return parts ? `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}` : "";
}

export function fromWibDateTimeLocal(value: string) {
  if (!value) return "";
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  const date = new Date(`${withSeconds}+07:00`);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

export function eventTimeRange(startAt: string, endAt?: string) {
  const time = (value: string) => new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(value)).replace(":", ".");
  const start = time(startAt);
  return endAt ? `${start}–${time(endAt)} WIB` : `${start} WIB`;
}

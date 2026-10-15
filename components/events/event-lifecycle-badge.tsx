"use client";

import { useEffect, useState } from "react";
import { Check, Clock3, Radio } from "lucide-react";
import { eventLifecycleAt } from "@/lib/event-detail";
import type { ManagedEvent } from "@/lib/platform-model";

export function EventLifecycleBadge({ event }: { event: Pick<ManagedEvent, "startAt" | "endAt" | "lifecycle"> }) {
  const { startAt, endAt, lifecycle } = event;
  const [status, setStatus] = useState(lifecycle);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function refresh() {
      clearTimeout(timer);
      const now = Date.now();
      setStatus(eventLifecycleAt({ startAt, endAt, lifecycle }, now));
      const boundary = [Date.parse(startAt), Date.parse(endAt)].find(time => time > now);
      if (boundary) timer = setTimeout(refresh, Math.min(boundary - now + 50, 2147483647));
    }
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearTimeout(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [startAt, endAt, lifecycle]);
  const Icon = status === "upcoming" ? Clock3 : status === "ongoing" ? Radio : Check;
  return <span className="event-lifecycle" data-status={status} role="status" aria-live="polite">
    <span key={status} className="event-lifecycle-icon"><Icon size={16} aria-hidden="true" /></span>
    {status === "upcoming" ? "Akan datang" : status === "ongoing" ? "Sedang berlangsung" : "Selesai"}
  </span>;
}

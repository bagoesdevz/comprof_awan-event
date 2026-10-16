"use client";

import Image from "next/image";
import { useState } from "react";
import { eventVisual } from "@/lib/event-detail";
import type { ManagedEvent } from "@/lib/platform-model";

export function EventCover({ event, sizes }: { event: Pick<ManagedEvent, "banner" | "blocks">; sizes: string }) {
  const source = eventVisual(event)?.src || "/awan-event-logo.jpeg";
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return <Image src={failedSource === source ? "/awan-event-logo.jpeg" : source} unoptimized alt="" fill sizes={sizes} className="event-cover-image" onError={() => setFailedSource(source)} />;
}

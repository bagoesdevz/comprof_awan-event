"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { EventSpeaker } from "@/lib/event-types";

export function HeroSpeaker({ speaker }: { speaker: EventSpeaker }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [speaker.photo]);
  return <figure className="event-hero-speaker">
    <div className="event-hero-speaker-frame">
      <span className="event-hero-speaker-disc" aria-hidden="true" />
      {speaker.photo && !failed ? <Image src={speaker.photo} alt={`Foto ${speaker.name}`} fill unoptimized priority sizes="(max-width: 760px) 92vw, 580px" onError={() => setFailed(true)} />
        : <div className="event-hero-speaker-empty" role="img" aria-label={`Foto ${speaker.name} belum tersedia`}><span className="event-hero-skeleton-head" aria-hidden="true" /><span className="event-hero-skeleton-body" aria-hidden="true" /><span>Foto pemateri belum tersedia</span></div>}
    </div>
    <figcaption className="event-hero-speaker-identity">
      <strong>{speaker.name}</strong>
      {speaker.role && <p>{speaker.role}</p>}
      {speaker.organization && <small>{speaker.organization}</small>}
    </figcaption>
  </figure>;
}

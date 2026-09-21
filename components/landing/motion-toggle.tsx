"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

export function MotionToggle() {
  const [paused, setPaused] = useState(false);
  return <button className="hero-motion-toggle" type="button" aria-pressed={paused} aria-label={paused ? "Jalankan animasi latar" : "Jeda animasi latar"} onClick={(event) => { const next = !paused; setPaused(next); event.currentTarget.closest("section")?.classList.toggle("motion-paused", next); }}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}<span>{paused ? "Lanjutkan animasi" : "Jeda animasi"}</span></button>;
}

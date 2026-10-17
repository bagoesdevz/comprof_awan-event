"use client";

import { useState } from "react";

export function ProfileAvatar({ name, src, className = "" }: { name: string; src?: string; className?: string }) {
  const [failedSource, setFailedSource] = useState("");
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]).join("") || "AE";
  return <span className={`profile-avatar ${className}`} aria-hidden="true">
    {src && failedSource !== src
      // Blob previews and immutable profile uploads share the same crop without an image proxy.
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={src} alt="" width={80} height={80} onError={() => setFailedSource(src)} />
      : initials}
  </span>;
}

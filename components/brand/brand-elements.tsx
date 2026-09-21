import Image from "next/image";
import Link from "next/link";
import { useId } from "react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand-logo ${compact ? "brand-logo--compact" : ""}`} aria-label="Awan Event — Beranda">
      <Image src="/awan-event-logo.jpeg" alt="" width={56} height={56} priority />
      <span><strong>Awan Event</strong><small>Educate · Empower · Better Tomorrow</small></span>
    </Link>
  );
}

export function BrandSlogan({ className = "" }: { className?: string }) {
  return <p className={`brand-slogan ${className}`} aria-label="Learn, Grow, Bright Tomorrow."><span>Learn,</span><span>Grow,</span><span>Bright</span><span>Tomorrow.</span></p>;
}

export function BrandWaves({ className = "" }: { className?: string }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg className={`brand-waves ${className}`} viewBox="0 0 900 700" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-purple`} x1="840" y1="60" x2="210" y2="710" gradientUnits="userSpaceOnUse"><stop stopColor="#C4B5FD" /><stop offset=".52" stopColor="#DBCEFF" /><stop offset="1" stopColor="#C7DAFF" /></linearGradient>
        <linearGradient id={`${id}-pink`} x1="780" y1="0" x2="410" y2="730" gradientUnits="userSpaceOnUse"><stop stopColor="#F1D6FA" /><stop offset=".52" stopColor="#DEC7F9" /><stop offset="1" stopColor="#E2EDFF" /></linearGradient>
        <linearGradient id={`${id}-blue`} x1="850" y1="150" x2="310" y2="630" gradientUnits="userSpaceOnUse"><stop stopColor="#C9DCFF" /><stop offset="1" stopColor="#E5DEFC" /></linearGradient>
      </defs>
      <g className="wave-layer wave-layer--one"><path d="M945 -140C595 -95 772 168 536 184C282 201 511 390 285 444C66 497 188 621-80 716L994 849Z" fill={`url(#${id}-pink)`} opacity=".55" /></g>
      <g className="wave-layer wave-layer--two"><path d="M1020 -110C655 -40 890 209 620 237C390 261 572 429 363 484C174 533 266 679-51 788L1042 882Z" fill={`url(#${id}-purple)`} opacity=".63" /></g>
      <g className="wave-layer wave-layer--three"><path d="M1100 -58C760 0 976 279 722 300C496 319 665 491 431 548C261 591 380 716 131 826L1122 910Z" fill={`url(#${id}-blue)`} opacity=".65" /></g>
      <g className="wave-layer wave-layer--four"><path d="M1170 10C892 33 1049 336 824 362C636 384 748 551 535 610C385 652 478 742 344 851L1142 910Z" fill={`url(#${id}-purple)`} opacity=".6" /></g>
    </svg>
  );
}

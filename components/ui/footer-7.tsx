"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";
import { usePlatform } from "@/components/platform/provider";

export interface Footer7Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
  credit?: {
    prefix: string;
    name: string;
    href: string;
  };
}

const defaultSections = [
  {
    title: "Jelajahi",
    links: [
      { name: "Event", href: "/events" },
      { name: "Program", href: "/programs" },
      { name: "Artikel", href: "/articles" },
      { name: "Tentang kami", href: "/about" },
    ],
  },
  {
    title: "Untuk peserta",
    links: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "E-tiket", href: "/dashboard/tickets" },
      { name: "Sertifikat", href: "/dashboard/certificates" },
      { name: "Masuk", href: "/login" },
    ],
  },
  {
    title: "Dukungan",
    links: [
      { name: "Kontak", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Ajukan program", href: "/programs/request" },
      { name: "Buat akun", href: "/register-account" },
    ],
  },
];

export const awanEventSocialIcons = {
  instagram: <FaInstagram className="h-5 w-5" />,
  facebook: <FaFacebook className="h-5 w-5" />,
  twitter: <FaTwitter className="h-5 w-5" />,
  linkedin: <FaLinkedin className="h-5 w-5" />,
  youtube: <FaYoutube className="h-5 w-5" />,
};

const defaultSocialLinks = [
  { icon: awanEventSocialIcons.instagram, href: "https://www.instagram.com/awan_event", label: "Instagram Awan Event" },
  { icon: awanEventSocialIcons.youtube, href: "https://www.youtube.com/@awanevent", label: "YouTube Awan Event" },
];

const defaultLegalLinks = [
  { name: "FAQ", href: "/faq" },
  { name: "Kontak", href: "/contact" },
];

export function Footer7({
  logo = {
    url: "/",
    src: "/awan-event-logo.jpeg",
    alt: "Logo Awan Event",
    title: "Awan Event",
  },
  sections = defaultSections,
  description = "Organisasi pendidikan dan pelatihan kesehatan di bawah naungan PT Awan Berkah Bermartabat.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2026 Awan Event. All rights reserved.",
  legalLinks = defaultLegalLinks,
  credit = {
    prefix: "Dibuat dengan hati oleh",
    name: "Berdikari Digital Nusantara",
    href: "https://www.berdignus.my.id",
  },
}: Footer7Props) {
  const { state, ready } = usePlatform();
  const visibleSections = sections.map((section) => ({
    ...section,
    links: section.links.filter((link) => {
      if (link.href !== "/login" && link.href !== "/register-account") return true;
      return ready && !state.session.loggedIn;
    }),
  }));

  return (
    <footer className="border-t border-primary-100 bg-primary-950 text-white" aria-label="Footer Awan Event">
      <div className="brand-container py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)] lg:gap-16">
          <div className="flex flex-col items-start">
            <a href={logo.url} className="inline-flex min-h-11 items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4 focus-visible:ring-offset-primary-950">
              <span className="grid h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white">
                <Image src={logo.src} alt={logo.alt} title={logo.title} width={56} height={56} className="h-full w-full object-cover" />
              </span>
              <span>
                <strong className="block font-display text-2xl font-bold tracking-[-0.045em]">{logo.title}</strong>
                <span className="mt-1 block text-[10px] tracking-[0.02em] text-white/45">Educate · Empower · Better Tomorrow</span>
              </span>
            </a>

            <p className="mt-6 max-w-md text-sm leading-7 text-white/60">{description}</p>

            {socialLinks.length > 0 ? (
              <ul className="mt-7 flex items-center gap-3" aria-label="Media sosial Awan Event">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a href={social.href} aria-label={social.label} target="_blank" rel="noreferrer" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/65 transition hover:-translate-y-0.5 hover:border-primary-400/60 hover:bg-primary-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 motion-reduce:transform-none">
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 sm:gap-6 lg:gap-10">
            {visibleSections.map((section, sectionIndex) => (
              <section key={section.title} className={sectionIndex === 2 ? "col-span-2 sm:col-span-1" : undefined} aria-labelledby={`footer-${section.title.toLowerCase().replaceAll(" ", "-")}`}>
                <h2 id={`footer-${section.title.toLowerCase().replaceAll(" ", "-")}`} className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-primary-400">{section.title}</h2>
                <ul className={`mt-5 grid gap-1 text-sm text-white/60 ${sectionIndex === 2 ? "grid-cols-2 sm:grid-cols-1" : ""}`}>
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="inline-flex min-h-11 items-center rounded-lg transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">{link.name}</a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-5 border-t border-white/10 pt-7 text-xs text-white/45 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
            <p>{copyright}</p>
            <p>
              {credit.prefix}{" "}
              <a href={credit.href} target="_blank" rel="noreferrer" className="font-semibold text-white/75 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
                {credit.name}
              </a>
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="inline-flex min-h-11 items-center transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">{link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { BrandLogo } from "@/components/brand/brand-elements";
import { Footer7 } from "@/components/ui/footer-7";
import { Navbar7 } from "@/components/ui/navbar-7";
import { usePlatform } from "@/components/platform/provider";

const publicLinks = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/events", label: "Event" },
  { href: "/articles", label: "Artikel" },
  { href: "/contact", label: "Kontak" },
];

export function PublicHeader() {
  return <Navbar7 logo={<BrandLogo />} links={publicLinks} />;
}

export function PublicFooter() {
  const { state } = usePlatform();
  const footerCms = state.cms["Footer"];
  return (
    <Footer7
      description={footerCms?.body || undefined}
      copyright={footerCms?.title || undefined}
    />
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site">
      <a href="#main-content" className="brand-skip-link">
        Lewati ke konten utama
      </a>
      <PublicHeader />
      <main id="main-content">{children}</main>
      <PublicFooter />
    </div>
  );
}

export function PublicPageHero({
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="public-page-hero">
      <div className="brand-container">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}

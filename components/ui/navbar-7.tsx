"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";

export type Navbar7Link = {
  label: string;
  href: string;
};

export type Navbar7Props = {
  logo: ReactNode;
  links: Navbar7Link[];
  loginHref?: string;
  loginLabel?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(`${href}/`) || pathname === href;
}

export function Navbar7({
  logo,
  links,
  loginHref = "/login",
  loginLabel = "Masuk",
  ctaHref = "/register-account",
  ctaLabel = "Daftar",
}: Navbar7Props) {
  const pathname = usePathname();
  const { state, ready } = usePlatform();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const navigationLinks = links.map((item) => {
    const active = isActivePath(pathname, item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`relative inline-flex min-h-11 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 motion-reduce:transition-none ${
          active
            ? "bg-primary-100 text-primary-800"
            : "text-content-body hover:bg-surface-tint hover:text-primary-800"
        }`}
      >
        {item.label}
      </Link>
    );
  });

  const signedIn = ready && state.session.loggedIn;
  const accountHref = state.session.role === "participant" ? "/dashboard" : "/admin";

  return (
    <header className="public-header">
      <div className="brand-container relative flex min-h-[80px] items-center justify-between gap-5 py-3">
        {logo}

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {navigationLinks}
        </nav>

        {ready && (
          <div className="hidden items-center gap-2 lg:flex">
            {signedIn ? (
              <Link
                href={accountHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary-950 px-6 text-[13px] font-semibold text-white shadow-[0_10px_24px_-14px_rgba(33,16,82,0.8)] transition hover:-translate-y-0.5 hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={loginHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-[13px] font-semibold text-content-title transition-colors hover:bg-primary-100 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
                >
                  {loginLabel}
                </Link>
                <Link
                  href={ctaHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary-950 px-6 text-[13px] font-semibold text-white shadow-[0_10px_24px_-14px_rgba(33,16,82,0.8)] transition hover:-translate-y-0.5 hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {ctaLabel}
                </Link>
              </>
            )}
          </div>
        )}

        <button
          ref={toggleRef}
          type="button"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-content-title/10 bg-white text-primary-800 shadow-sm transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 lg:hidden"
          aria-expanded={open}
          aria-controls="awan-public-menu"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>

        <nav
          id="awan-public-menu"
          className={`absolute left-0 right-0 top-[calc(100%+8px)] origin-top rounded-[24px_24px_24px_8px] border border-content-title/10 bg-white p-3 shadow-[0_28px_70px_-28px_rgba(33,16,82,0.45)] transition duration-200 motion-reduce:transition-none lg:hidden ${
            open
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible -translate-y-2 scale-[0.98] opacity-0"
          }`}
          aria-label="Navigasi utama seluler"
          aria-hidden={!open}
        >
          <div className="grid gap-1">{navigationLinks}</div>
          {ready && (
            <div className={`mt-3 grid gap-2 border-t border-content-title/10 pt-3 ${signedIn ? "grid-cols-1" : "grid-cols-2"}`}>
              {signedIn ? (
                <Link
                  href={accountHref}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary-950 px-4 text-sm font-semibold text-white"
                  tabIndex={open ? undefined : -1}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href={loginHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-content-title/10 bg-white px-4 text-sm font-semibold text-content-title"
                    tabIndex={open ? undefined : -1}
                  >
                    {loginLabel}
                  </Link>
                  <Link
                    href={ctaHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary-950 px-4 text-sm font-semibold text-white"
                    tabIndex={open ? undefined : -1}
                  >
                    {ctaLabel}
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

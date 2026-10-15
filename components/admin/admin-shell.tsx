"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, ShieldCheck, X } from "lucide-react";
import { AppSidebar, getSidebarNavigation } from "@/components/app-sidebar";
import { BrandLogo } from "@/components/brand/brand-elements";
import { usePlatform } from "@/components/platform/provider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { isEventPublicCode } from "@/lib/event-sharing";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, ready, error, refresh, action } = usePlatform();
  const linksInitialized = useRef(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const groups = getSidebarNavigation("admin", state.session.role);
  const items = groups.flatMap((group) => group.items);
  const activeItem = items.find((item) => item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  const searchResults = items.filter((item) => item.label.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID")));
  const roleLabel = state.session.role === "super" ? "Super Admin" : "Admin Operasional";

  useEffect(() => {
    setQuery("");
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!ready) return;
    if (!state.session.loggedIn) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (state.session.role === "participant") router.replace("/dashboard");
  }, [pathname, ready, router, state.session.loggedIn, state.session.role]);

  const authorized = ready && state.session.loggedIn && state.session.role !== "participant";

  useEffect(() => {
    if (!authorized || linksInitialized.current || !state.events.some(event => !isEventPublicCode(event.publicCode))) return;
    linksInitialized.current = true;
    void action({ type: "ensure-event-links" });
  }, [authorized, state.events, action]);

  if (!authorized) {
    return (
      <main className="admin-session-loading" aria-live="polite" aria-busy={!error}>
        <BrandLogo compact />
        <span><ShieldCheck size={19} aria-hidden="true" /></span>
        <p>{error ? "Sesi admin belum dapat dimuat." : ready ? "Mengalihkan ke halaman akun Anda…" : "Memeriksa sesi admin…"}</p>
        {error && <button type="button" className="flow-button" onClick={() => void refresh()}>Coba lagi</button>}
      </main>
    );
  }

  return (
    <SidebarProvider className="admin-workspace">
      <a href="#admin-content" className="brand-skip-link">Lewati ke konten utama</a>
      <AppSidebar area="admin" />
      <SidebarInset className="text-content-title">
        <header className="admin-shell-header">
          <SidebarTrigger />

          <div className="min-w-0 lg:w-44 lg:shrink-0">
            <span className="block text-xs text-content-muted">Admin Awan Event</span>
            <strong className="mt-1 block truncate text-sm">{activeItem?.label || "Kelola event"}</strong>
          </div>

          <div className={`admin-menu-search ${searchOpen ? "is-open" : ""}`}>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              aria-label="Cari menu admin"
              placeholder="Cari menu admin..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") { setQuery(""); setSearchOpen(false); }
                if (event.key === "Enter" && query.trim() && searchResults[0]) router.push(searchResults[0].href);
              }}
              className="min-h-11 w-full rounded-2xl border border-primary-600/10 bg-surface-muted py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
            {query && (
              <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-primary-600/10 bg-white p-2 shadow-diffusion" role="region" aria-label="Hasil pencarian menu">
                <p className="px-3 py-2 text-xs font-medium text-content-muted">Menu yang sesuai</p>
                {searchResults.length ? searchResults.map((item) => (
                  <Link href={item.href} key={item.href} onClick={() => setQuery("")} className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-sm font-medium transition hover:bg-primary-100">
                    {item.label}
                  </Link>
                )) : <span className="block px-3 py-4 text-xs text-content-muted">Menu tidak ditemukan. Coba kata lain.</span>}
              </div>
            )}
          </div>

          <button type="button" className="admin-search-toggle" aria-label={searchOpen ? "Tutup pencarian menu" : "Cari menu admin"} aria-expanded={searchOpen} onClick={() => setSearchOpen(value => !value)}>
            {searchOpen ? <X size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
          </button>

          <Link href="/" className="hidden min-h-11 shrink-0 items-center gap-2 rounded-2xl px-3 text-xs font-semibold text-content-body transition hover:bg-primary-100 hover:text-primary-800 xl:flex">
            Lihat website
          </Link>
          <span className="admin-role-label" title={roleLabel}>
            <ShieldCheck size={15} aria-hidden="true" />
            <span className="hidden sm:inline">{roleLabel}</span>
          </span>
        </header>

        <div id="admin-content" tabIndex={-1} className="admin-shell-content">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

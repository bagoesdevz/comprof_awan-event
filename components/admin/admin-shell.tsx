"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Search, ShieldCheck } from "lucide-react";
import { AppSidebar, getSidebarNavigation } from "@/components/app-sidebar";
import { BrandLogo } from "@/components/brand/brand-elements";
import { usePlatform } from "@/components/platform/provider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, ready } = usePlatform();
  const [query, setQuery] = useState("");
  const groups = getSidebarNavigation("admin", state.session.role);
  const items = groups.flatMap((group) => group.items);
  const activeItem = items.find((item) => item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  const searchResults = items.filter((item) => item.label.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID")));
  const roleLabel = state.session.role === "super" ? "Super Admin" : "Admin Operasional";

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    if (!ready) return;
    if (!state.session.loggedIn) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (state.session.role === "participant") router.replace("/dashboard");
  }, [pathname, ready, router, state.session.loggedIn, state.session.role]);

  const authorized = ready && state.session.loggedIn && state.session.role !== "participant";

  if (!authorized) {
    return (
      <main className="admin-session-loading" aria-live="polite" aria-busy="true">
        <BrandLogo compact />
        <span><ShieldCheck size={19} aria-hidden="true" /></span>
        <p>{ready ? "Mengalihkan ke ruang akunmu…" : "Memeriksa sesi admin…"}</p>
      </main>
    );
  }

  return (
    <SidebarProvider>
      <a href="#admin-content" className="brand-skip-link">Lewati ke konten utama</a>
      <AppSidebar area="admin" />
      <SidebarInset className="text-content-title">
        <header className="sticky top-0 z-20 grid min-h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-primary-600/10 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:flex lg:px-8">
          <SidebarTrigger />

          <div className="min-w-0 lg:w-44 lg:shrink-0">
            <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-content-muted">Dashboard admin</span>
            <strong className="mt-1 block truncate text-sm">{activeItem?.label || "Kelola event"}</strong>
          </div>

          <div className="relative col-span-3 row-start-2 min-w-0 lg:col-auto lg:row-auto lg:ml-auto lg:w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" aria-hidden="true" />
            <input
              type="search"
              aria-label="Cari menu admin"
              placeholder="Cari menu admin..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }}
              className="min-h-11 w-full rounded-2xl border border-primary-600/10 bg-surface-muted py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
            {query && (
              <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-primary-600/10 bg-white p-2 shadow-diffusion" role="region" aria-label="Hasil pencarian menu">
                <p className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-content-muted">Menu yang sesuai</p>
                {searchResults.length ? searchResults.map((item) => (
                  <Link href={item.href} key={item.href} onClick={() => setQuery("")} className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-sm font-medium transition hover:bg-primary-100">
                    {item.label}<ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                )) : <span className="block px-3 py-4 text-xs text-content-muted">Menu tidak ditemukan. Coba kata lain.</span>}
              </div>
            )}
          </div>

          <Link href="/" className="hidden min-h-11 shrink-0 items-center gap-2 rounded-2xl px-3 text-xs font-semibold text-content-body transition hover:bg-primary-100 hover:text-primary-800 xl:flex">
            Lihat website<ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <span className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl bg-primary-100 px-3 text-xs font-semibold text-primary-800" title={roleLabel}>
            <ShieldCheck size={15} aria-hidden="true" />
            <span className="hidden sm:inline">{roleLabel}</span>
          </span>
        </header>

        <div id="admin-content" tabIndex={-1} className="min-w-0 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { AppSidebar, getSidebarNavigation } from "@/components/app-sidebar";
import { NotificationMenu } from "@/components/dashboard/notification-menu";
import { usePlatform } from "@/components/platform/provider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function ParticipantShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = usePlatform();
  const items = getSidebarNavigation("participant", state.session.role).flatMap((group) => group.items);
  const activeItem = items.find((item) => item.href === "/dashboard" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <SidebarProvider>
      <a href="#participant-content" className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary-950 shadow-diffusion transition focus:translate-y-0">Lewati ke konten utama</a>
      <AppSidebar area="participant" />
      <SidebarInset className="participant-workspace text-content-title">
        <header className="sticky top-0 z-20 flex min-h-[72px] items-center gap-3 border-b border-primary-600/10 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
          <SidebarTrigger />
          <div className="min-w-0 flex-1">
            <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-content-muted">Dashboard peserta</span>
            <strong className="mt-1 block truncate text-sm text-content-title">{activeItem?.label || "Ruang aktivitas"}</strong>
          </div>
          <NotificationMenu compact />
        </header>
        <div id="participant-content" tabIndex={-1} className="min-w-0 px-4 py-7 outline-none sm:px-6 lg:px-10 lg:py-10 xl:px-12">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  PanelsTopLeft,
  QrCode,
  ShieldCheck,
  Ticket,
  UserCog,
  UserRound,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-elements";
import { usePlatform } from "@/components/platform/provider";
import type { Role } from "@/lib/platform-model";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

export type SidebarArea = "participant" | "admin";
export type SidebarNavigationItem = { href: string; label: string; icon: LucideIcon };
export type SidebarNavigationGroup = { label: string; superOnly?: boolean; items: SidebarNavigationItem[] };

const participantGroups: SidebarNavigationGroup[] = [
  {
    label: "Ruang peserta",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/events", label: "Kelas saya", icon: BookOpen },
      { href: "/dashboard/tickets", label: "E-tiket", icon: Ticket },
      { href: "/dashboard/certificates", label: "Sertifikat", icon: Award },
      { href: "/dashboard/profile", label: "Profil", icon: UserRound },
    ],
  },
];

const adminGroups: SidebarNavigationGroup[] = [
  {
    label: "Ringkasan",
    items: [
      { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
      { href: "/admin/reports", label: "Laporan", icon: BarChart3 },
    ],
  },
  {
    label: "Event & konten",
    items: [
      { href: "/admin/events", label: "Event", icon: CalendarDays },
      { href: "/admin/cms", label: "Konten website", icon: PanelsTopLeft },
      { href: "/admin/operations/leads", label: "Lead program", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Peserta & kegiatan",
    items: [
      { href: "/admin/operations/participants", label: "Peserta", icon: Users },
      { href: "/admin/operations/waitlist", label: "Waitlist", icon: ListChecks },
      { href: "/admin/operations/evaluations", label: "Evaluasi", icon: ClipboardCheck },
      { href: "/admin/certificates", label: "Sertifikat", icon: Award },
      { href: "/admin/check-in", label: "Check-in", icon: QrCode },
    ],
  },
  {
    label: "Finance & komunikasi",
    items: [
      { href: "/admin/payments", label: "Transaksi", icon: CreditCard },
      { href: "/admin/operations/finance", label: "Finance", icon: WalletCards },
      { href: "/admin/reminders", label: "Pengingat WA", icon: Megaphone },
    ],
  },
  {
    label: "Sistem",
    superOnly: true,
    items: [
      { href: "/admin/users", label: "Users & roles", icon: ShieldCheck },
      { href: "/admin/operations/settings", label: "Pengaturan", icon: UserCog },
    ],
  },
];

export function getSidebarNavigation(area: SidebarArea, role: Role) {
  const groups = area === "participant" ? participantGroups : adminGroups;
  return groups.filter((group) => !group.superOnly || role === "super");
}

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ area }: { area: SidebarArea }) {
  const pathname = usePathname();
  const { state: platformState, update } = usePlatform();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const groups = getSidebarNavigation(area, platformState.session.role);
  const expanded = isMobile || state === "expanded";
  const profile = platformState.profiles[platformState.session.email];
  const profileName = profile?.name || (area === "admin" ? "Admin Awan Event" : "Peserta Awan Event");
  const initials = profileName.split(" ").slice(0, 2).map((part) => part[0]).join("");
  const roleLabel = area === "participant" ? "Peserta" : platformState.session.role === "super" ? "Super Admin" : "Admin Operasional";

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" aria-label={area === "participant" ? "Navigasi dashboard peserta" : "Navigasi dashboard admin"}>
      <SidebarHeader className="border-b border-primary-600/10 pr-12 md:pr-4">
        {expanded ? (
          <div>
            <BrandLogo compact />
            <p className="mt-3 text-[11px] font-medium text-content-muted">{area === "participant" ? "Ruang peserta" : "Pusat operasional"}</p>
          </div>
        ) : (
          <Link href="/" aria-label="Awan Event — Beranda" className="mx-auto grid h-10 w-10 place-items-center overflow-hidden rounded-full ring-1 ring-primary-600/15">
            <Image src="/awan-event-logo.jpeg" alt="" width={40} height={40} />
          </Link>
        )}
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => {
          const groupIsActive = group.items.some((item) => isActivePath(pathname, item.href));
          const menu = (
            <SidebarMenu className={expanded ? "ml-3 border-l border-primary-600/10 pl-2" : ""}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={expanded ? "min-h-10 rounded-xl text-[13px] font-medium" : undefined}
                    >
                      <Link href={item.href} aria-current={active ? "page" : undefined} onClick={closeMobile}>
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          );

          if (!expanded) {
            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupContent>{menu}</SidebarGroupContent>
              </SidebarGroup>
            );
          }

          return (
            <Collapsible
              key={`${platformState.session.role}-${group.label}`}
              defaultOpen={groupIsActive || area === "participant"}
              className="group/collapsible"
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-[13px] font-medium text-content-body outline-none transition hover:bg-primary-100/70 hover:text-primary-800 focus-visible:ring-2 focus-visible:ring-primary-400 data-[state=open]:bg-primary-100/40 data-[state=open]:text-primary-800"
                  >
                    <span className="min-w-0 flex-1 truncate">{group.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" aria-hidden="true" />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-[sidebar-collapse-up_160ms_ease-out] data-[state=open]:animate-[sidebar-collapse-down_180ms_ease-out]">
                  <SidebarGroupContent className="pt-1">{menu}</SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Lihat website">
              <Link href="/" onClick={closeMobile}>
                {area === "participant" ? <Home aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
                <span>{area === "participant" ? "Kembali ke beranda" : "Lihat website"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className={`flex items-center gap-3 rounded-2xl bg-primary-100/70 p-2 ${expanded ? "" : "justify-center"}`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-primary-700 shadow-sm">{initials}</span>
          {expanded && <div className="min-w-0 flex-1"><strong className="block truncate text-xs">{profileName}</strong><small className="mt-0.5 block truncate text-[10px] text-content-muted">{roleLabel}</small></div>}
          {expanded && (
            <Link
              href="/login"
              onClick={() => update((draft) => { draft.session.loggedIn = false; })}
              aria-label="Keluar dari akun"
              title="Keluar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-content-muted transition hover:bg-white hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

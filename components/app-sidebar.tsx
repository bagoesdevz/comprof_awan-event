"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
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
export type SidebarNavigationGroup = { label: string; icon?: LucideIcon; superOnly?: boolean; items: SidebarNavigationItem[] };

const participantGroups: SidebarNavigationGroup[] = [
  {
    label: "Dashboard",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Kegiatan saya",
    icon: BookOpen,
    items: [
      { href: "/dashboard/events", label: "Kelas saya", icon: BookOpen },
      { href: "/dashboard/tickets", label: "E-tiket", icon: Ticket },
      { href: "/dashboard/certificates", label: "Sertifikat", icon: Award },
    ],
  },
  {
    label: "Profil",
    items: [{ href: "/dashboard/profile", label: "Profil", icon: UserRound }],
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
    icon: CalendarDays,
    items: [
      { href: "/admin/events", label: "Event", icon: CalendarDays },
      { href: "/admin/cms", label: "Konten website", icon: PanelsTopLeft },
      { href: "/admin/operations/leads", label: "Lead program", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Peserta & kegiatan",
    icon: Users,
    items: [
      { href: "/admin/operations/participants", label: "Peserta", icon: Users },
      { href: "/admin/operations/waitlist", label: "Daftar tunggu", icon: ListChecks },
      { href: "/admin/operations/evaluations", label: "Evaluasi", icon: ClipboardCheck },
      { href: "/admin/certificates", label: "Sertifikat", icon: Award },
      { href: "/admin/check-in", label: "Check-in", icon: QrCode },
    ],
  },
  {
    label: "Keuangan & komunikasi",
    icon: WalletCards,
    items: [
      { href: "/admin/payments", label: "Transaksi", icon: CreditCard },
      { href: "/admin/operations/finance", label: "Keuangan", icon: WalletCards },
      { href: "/admin/reminders", label: "Draf pesan", icon: Megaphone },
    ],
  },
  {
    label: "Profil",
    items: [{ href: "/admin/profile", label: "Profil saya", icon: UserRound }],
  },
  {
    label: "Sistem",
    icon: ShieldCheck,
    superOnly: true,
    items: [
      { href: "/admin/users", label: "Akun & peran", icon: ShieldCheck },
      { href: "/admin/operations/settings", label: "Pengaturan", icon: UserCog },
    ],
  },
];

export function getSidebarNavigation(area: SidebarArea, role: Role) {
  const groups = area === "participant" ? participantGroups : adminGroups;
  return groups.filter((group) => !group.superOnly || role === "super");
}

export function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationGroup({ group, pathname, expanded, closeMobile }: {
  group: SidebarNavigationGroup;
  pathname: string;
  expanded: boolean;
  closeMobile: () => void;
}) {
  const active = group.items.some((item) => isActivePath(pathname, item.href));
  const [open, setOpen] = useState(active || group.label === "Event & konten");
  useEffect(() => {
    if (active) setOpen(true);
  }, [active, pathname]);
  const nested = expanded && Boolean(group.icon);
  const menu = (
    <SidebarMenu className={nested ? "awan-nav-branches" : undefined}>
      {group.items.map((item) => {
        const Icon = item.icon;
        const selected = isActivePath(pathname, item.href);
        return (
          <SidebarMenuItem key={item.href} className={nested ? "awan-nav-branch" : undefined}>
            <SidebarMenuButton asChild isActive={selected} tooltip={item.label}>
              <Link href={item.href} aria-label={item.label} aria-current={selected ? "page" : undefined} onClick={closeMobile}>
                {!nested && <Icon aria-hidden="true" />}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
  if (!nested) return <SidebarGroup><SidebarGroupContent>{menu}</SidebarGroupContent></SidebarGroup>;
  const GroupIcon = group.icon!;
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="awan-nav-group" data-current={active}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <button type="button" className="awan-nav-group-trigger">
            <GroupIcon aria-hidden="true" />
            <span>{group.label}</span>
            <ChevronDown className="awan-nav-disclosure" aria-hidden="true" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="awan-nav-group-content">
          <SidebarGroupContent>{menu}</SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
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
  const profileHref = area === "admin" ? "/admin/profile" : "/dashboard/profile";

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" className="awan-sidebar" aria-label={area === "participant" ? "Navigasi dashboard peserta" : "Navigasi dashboard admin"}>
      <SidebarHeader className="awan-sidebar-header">
        {expanded ? (
          <div>
            <BrandLogo compact />
            <p className="awan-sidebar-caption">{area === "participant" ? "Ruang peserta" : "Pusat operasional"}</p>
          </div>
        ) : (
          <Link href="/" aria-label="Awan Event | Beranda" className="awan-sidebar-logo">
            <Image src="/awan-event-logo.jpeg" alt="" width={40} height={40} />
          </Link>
        )}
      </SidebarHeader>

      <SidebarContent className="awan-sidebar-content">
        <nav aria-label={area === "participant" ? "Menu peserta" : "Menu admin"} className="awan-sidebar-navigation">
          {groups.map((group) => <NavigationGroup key={`${platformState.session.role}-${group.label}`} group={group} pathname={pathname} expanded={expanded} closeMobile={closeMobile} />)}
        </nav>
      </SidebarContent>

      <SidebarSeparator />
      <SidebarFooter className="awan-sidebar-footer">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Lihat website">
              <Link href="/" aria-label={area === "participant" ? "Kembali ke beranda" : "Lihat website"} onClick={closeMobile}>
                <Home aria-hidden="true" />
                <span>{area === "participant" ? "Kembali ke beranda" : "Lihat website"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="awan-sidebar-account">
          <Link href={profileHref} aria-label="Edit profil saya" title="Edit profil saya" className="awan-sidebar-profile" onClick={closeMobile}>
            <span className="awan-sidebar-avatar" aria-hidden="true">{initials}</span>
            {expanded && <span className="awan-sidebar-identity"><strong title={profileName}>{profileName}</strong><small>{roleLabel}</small></span>}
          </Link>
            <Link
              href="/login"
              onClick={() => update((draft) => { draft.session.loggedIn = false; })}
              aria-label="Keluar dari akun"
              title="Keluar"
              className="awan-sidebar-logout"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Link>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

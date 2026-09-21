"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlatform } from "@/components/platform/provider";

const noticeDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export function NotificationMenu({ compact = false }: { compact?: boolean }) {
  const { state, update } = usePlatform();
  const notifications = state.notices.filter(notice => notice.email === state.session.email);
  const unreadCount = notifications.filter(notice => !notice.read).length;

  const markRead = (id: string) => update(draft => {
    const notice = draft.notices.find(item => item.id === id);
    if (notice) notice.read = true;
  });

  const markAllRead = () => update(draft => {
    draft.notices.forEach(notice => {
      if (notice.email === draft.session.email) notice.read = true;
    });
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Buka notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ""}`}
          className={`ml-auto inline-flex min-h-11 items-center gap-2.5 rounded-full border border-content-title/10 bg-white text-sm font-semibold text-primary-800 shadow-sm transition hover:border-primary-400 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${compact ? "min-w-11 justify-center px-3" : "px-3.5"}`}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className={compact ? "sr-only" : ""}>Notifikasi</span>
          {unreadCount > 0 && (
            <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold tabular-nums text-white" aria-hidden="true">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(390px,calc(100vw-32px))] p-2">
        <div className="flex items-start justify-between gap-4 px-3 pb-2 pt-2">
          <div>
            <DropdownMenuLabel className="p-0 text-base">Notifikasi</DropdownMenuLabel>
            <p className="mt-1 text-xs leading-5 text-content-muted">
              {unreadCount ? `${unreadCount} pembaruan belum dibaca` : "Semua pembaruan sudah dibaca"}
            </p>
          </div>
          <span className="rounded-full bg-primary-100 px-2.5 py-1 font-mono text-[10px] font-medium text-primary-800">
            {notifications.length} total
          </span>
        </div>

        <DropdownMenuSeparator />
        {notifications.length ? (
          <DropdownMenuGroup className="max-h-[min(420px,60vh)] overflow-y-auto">
            {notifications.map(notice => (
              <DropdownMenuItem key={notice.id} asChild className="items-start p-0">
                <Link
                  href={notice.href}
                  onClick={() => markRead(notice.id)}
                  className="grid w-full grid-cols-[10px_minmax(0,1fr)] gap-3 px-3 py-3"
                >
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${notice.read ? "bg-content-title/15" : "bg-primary-600"}`} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="flex items-start justify-between gap-3">
                      <strong className="text-sm font-semibold leading-5">{notice.title}</strong>
                      {!notice.read && <span className="shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-800">Baru</span>}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-content-body">{notice.body}</span>
                    <span className="mt-2 block text-[11px] text-content-muted">{noticeDate.format(new Date(notice.createdAt))}</span>
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ) : (
          <div className="px-3 py-8 text-center">
            <Bell className="mx-auto h-6 w-6 text-primary-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">Belum ada notifikasi</p>
            <p className="mt-1 text-xs text-content-muted">Pembaruan event akan muncul di sini.</p>
          </div>
        )}

        {unreadCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={markAllRead} className="justify-center gap-2 font-semibold text-primary-800">
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Tandai semua dibaca
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

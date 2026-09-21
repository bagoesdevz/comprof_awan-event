"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar harus digunakan di dalam SidebarProvider.");
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & { defaultOpen?: boolean }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);
  const state: SidebarContextValue["state"] = open ? "expanded" : "collapsed";

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((current) => !current);
    else setOpen((current) => !current);
  }, [isMobile]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const value = React.useMemo(
    () => ({ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }),
    [state, open, openMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={150}>
        <div className={cn("flex min-h-svh w-full bg-surface-base", className)} {...props}>{children}</div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  className,
  collapsible = "icon",
  ...props
}: React.ComponentProps<"aside"> & { collapsible?: "icon" | "offcanvas" | "none" }) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-[19rem] max-w-[88vw] border-primary-600/10 bg-white p-0 text-content-title">
          <SheetHeader className="sr-only"><SheetTitle>Navigasi</SheetTitle><SheetDescription>Menu utama Awan Event.</SheetDescription></SheetHeader>
          <div className="flex h-full min-h-0 flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  const collapsed = collapsible === "icon" && state === "collapsed";
  const offcanvas = collapsible === "offcanvas" && state === "collapsed";

  return (
    <aside
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      className={cn(
        "group/sidebar sticky top-0 z-30 hidden h-svh shrink-0 flex-col border-r border-primary-600/10 bg-white text-content-title transition-[width,transform] duration-200 ease-out md:flex",
        collapsed ? "w-[4.5rem]" : "w-64",
        offcanvas && "-ml-64 w-64 -translate-x-full",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export const SidebarInset = React.forwardRef<HTMLElement, React.ComponentProps<"main">>(function SidebarInset({ className, ...props }, ref) {
  return <main ref={ref} className={cn("relative min-w-0 flex-1 bg-surface-base", className)} {...props} />;
});

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(function SidebarTrigger({ className, onClick, ...props }, ref) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button ref={ref} type="button" variant="ghost" size="icon" className={cn("h-11 w-11 rounded-2xl bg-primary-100 text-primary-800 hover:bg-primary-100 hover:text-primary-950", className)} onClick={(event) => { onClick?.(event); toggleSidebar(); }} aria-label="Buka atau tutup sidebar" {...props}>
      <PanelLeft className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
});

export function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();
  return <button type="button" tabIndex={-1} aria-label="Buka atau tutup sidebar" title="Buka atau tutup sidebar" onClick={toggleSidebar} className={cn("absolute inset-y-0 -right-2 z-20 hidden w-4 after:absolute after:inset-y-0 after:left-1/2 after:w-px hover:after:bg-primary-400 md:block", className)} {...props} />;
}

export const SidebarHeader = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("flex shrink-0 flex-col gap-2 p-4", className)} {...props} />;
export const SidebarFooter = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("mt-auto flex shrink-0 flex-col gap-2 p-4", className)} {...props} />;
export const SidebarContent = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-3 py-2", className)} {...props} />;
export const SidebarGroup = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("grid min-w-0 gap-1", className)} {...props} />;
export const SidebarGroupContent = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("min-w-0", className)} {...props} />;

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  const { state, isMobile } = useSidebar();
  if (!isMobile && state === "collapsed") return null;
  return <div className={cn("px-3 pb-1 pt-2 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-content-muted", className)} {...props} />;
}

export const SidebarMenu = ({ className, ...props }: React.ComponentProps<"ul">) => <ul className={cn("grid min-w-0 gap-1", className)} {...props} />;
export const SidebarMenuItem = ({ className, ...props }: React.ComponentProps<"li">) => <li className={cn("min-w-0", className)} {...props} />;

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean; isActive?: boolean; tooltip?: string }) {
  const Comp = asChild ? Slot : "button";
  const { state, isMobile } = useSidebar();
  const collapsed = !isMobile && state === "collapsed";
  const button = (
    <Comp
      data-active={isActive}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-2xl px-3 text-left text-sm text-content-body outline-none transition hover:bg-primary-100/70 hover:text-primary-800 focus-visible:ring-2 focus-visible:ring-primary-400 data-[active=true]:bg-primary-100 data-[active=true]:font-semibold data-[active=true]:text-primary-800 [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:shrink-0",
        collapsed && "justify-center px-0 [&>span]:hidden",
        className,
      )}
      {...props}
    />
  );
  if (!tooltip || !collapsed) return button;
  return <Tooltip><TooltipTrigger asChild>{button}</TooltipTrigger><TooltipContent side="right">{tooltip}</TooltipContent></Tooltip>;
}

export function SidebarSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="separator" className={cn("mx-3 h-px bg-primary-600/10", className)} {...props} />;
}

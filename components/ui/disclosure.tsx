"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function Disclosure({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return <Collapsible className={cn("ux-disclosure", className)}>
    <CollapsibleTrigger type="button" data-ui="disclosure-trigger" className="ux-select-trigger">
      <span>{title}</span>
      <ChevronDown size={18} aria-hidden="true" className="ux-select-chevron" />
    </CollapsibleTrigger>
    <CollapsibleContent forceMount className="ux-disclosure-content">{children}</CollapsibleContent>
  </Collapsible>;
}

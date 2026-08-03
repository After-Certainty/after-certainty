"use client";

import type { ReactNode } from "react";

import { MobileDisclosure } from "@/components/ui/mobile-disclosure";

type RelatedSectionDisclosureProps = {
  /** Stable id for aria-controls / single-open groups. */
  id: string;
  title: string;
  /** e.g. "3 concepts" — shown under the title in the toggle. */
  countLabel: string;
  regionLabel?: string;
  /** When true (default), panel stays open from `md` up. */
  alwaysOpenFromMd?: boolean;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Mobile-collapsed related / dynamics section with count in the summary.
 * Desktop (`md+`): children always visible; toggle chrome hidden.
 * Single SSR content tree — panel stays in the document.
 */
export function RelatedSectionDisclosure({
  id,
  title,
  countLabel,
  regionLabel,
  alwaysOpenFromMd = true,
  defaultOpen = false,
  className = "",
  children,
}: RelatedSectionDisclosureProps) {
  return (
    <MobileDisclosure
      id={id}
      regionLabel={regionLabel ?? title}
      alwaysOpenFromMd={alwaysOpenFromMd}
      defaultOpen={defaultOpen}
      className={className}
      summaryClassName="flex min-h-11 w-full items-center gap-3 border-b border-border/35 py-[var(--explore-row-py)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
      summary={
        <span className="block min-w-0 leading-tight">
          <span className="block text-[11px] uppercase tracking-[0.24em] text-muted">{title}</span>
          <span className="mt-0.5 block text-[11px] leading-none text-muted">{countLabel}</span>
        </span>
      }
      panelClassName="pt-4 md:pt-0"
    >
      {/* Desktop section label (toggle is md:hidden) */}
      <h2 className="mb-4 hidden text-[11px] uppercase tracking-[0.24em] text-muted md:block">
        {title}
        <span className="mt-0.5 block text-[11px] normal-case tracking-normal text-muted/80">
          {countLabel}
        </span>
      </h2>
      {children}
    </MobileDisclosure>
  );
}

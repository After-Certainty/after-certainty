"use client";

import type { ReactNode } from "react";

import { MobileDisclosure } from "@/components/ui/mobile-disclosure";
import { LinkifiedText } from "@/components/ui/linkified-text";

export type EntityIntroDisclosureProps = {
  /** Stable id for aria-controls / region. */
  id: string;
  /** Accessible name for the expanded region. */
  regionLabel: string;
  /** Short teaser shown above the disclosure on mobile. */
  teaser: string | null;
  /** Label for the mobile expand control. */
  expandLabel?: string;
  /** When true (default), panel stays open from `md` up. */
  alwaysOpenFromMd?: boolean;
  /** Full prose (and any other long content) — always in the document. */
  children: ReactNode;
  className?: string;
};

/**
 * Mobile: optional teaser + collapsed expand control.
 * Desktop (`md+`): children always visible when `alwaysOpenFromMd` (toggle chrome hidden).
 * Single content tree — panel stays in the document for SEO.
 */
export function EntityIntroDisclosure({
  id,
  regionLabel,
  teaser,
  expandLabel = "Read full description",
  alwaysOpenFromMd = true,
  children,
  className = "",
}: EntityIntroDisclosureProps) {
  return (
    <div className={`mt-6 max-w-2xl md:mt-10 ${className}`.trim()}>
      {teaser ? (
        <p className="text-base leading-relaxed text-muted md:hidden">
          <LinkifiedText text={teaser} />
        </p>
      ) : null}

      <MobileDisclosure
        id={id}
        regionLabel={regionLabel}
        alwaysOpenFromMd={alwaysOpenFromMd}
        defaultOpen={false}
        className={teaser ? "mt-3 md:mt-0" : ""}
        summaryClassName="flex min-h-11 w-full items-center gap-3 py-2 text-left text-sm text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        summary={<span>{expandLabel}</span>}
        panelClassName="mt-4 md:mt-0"
      >
        {children}
      </MobileDisclosure>
    </div>
  );
}

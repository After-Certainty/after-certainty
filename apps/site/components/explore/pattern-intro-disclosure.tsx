"use client";

import type { ReactNode } from "react";

import { MobileDisclosure } from "@/components/ui/mobile-disclosure";
import { LinkifiedText } from "@/components/ui/linkified-text";

type PatternIntroDisclosureProps = {
  /** Short teaser shown above the disclosure on mobile. */
  teaser: string | null;
  /** Full summary + narrative (and any other long prose) — always in the document. */
  children: ReactNode;
};

/**
 * Mobile: teaser + collapsed “Read full description”.
 * Desktop (`md+`): children always visible (toggle hidden).
 * Single content tree — panel stays in the document for SEO.
 */
export function PatternIntroDisclosure({ teaser, children }: PatternIntroDisclosureProps) {
  return (
    <div className="mt-6 max-w-2xl md:mt-10">
      {teaser ? (
        <p className="text-base leading-relaxed text-muted md:hidden">
          <LinkifiedText text={teaser} />
        </p>
      ) : null}

      <MobileDisclosure
        id="pattern-full-description"
        regionLabel="Full pattern description"
        alwaysOpenFromMd
        defaultOpen={false}
        className={teaser ? "mt-3 md:mt-0" : ""}
        summaryClassName="flex min-h-11 w-full items-center gap-3 py-2 text-left text-sm text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        summary={<span>Read full description</span>}
        panelClassName="mt-4 md:mt-0"
      >
        {children}
      </MobileDisclosure>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";

import { EntityIntroDisclosure } from "@/components/explore/entity-intro-disclosure";

type PatternIntroDisclosureProps = {
  /** Short teaser shown above the disclosure on mobile. */
  teaser: string | null;
  /** Full summary + narrative (and any other long prose) — always in the document. */
  children: ReactNode;
};

/**
 * Pattern detail intro — thin wrapper over {@link EntityIntroDisclosure}.
 * Mobile: teaser + collapsed “Read full description”.
 * Desktop (`md+`): children always visible (toggle hidden).
 */
export function PatternIntroDisclosure({ teaser, children }: PatternIntroDisclosureProps) {
  return (
    <EntityIntroDisclosure
      id="pattern-full-description"
      regionLabel="Full pattern description"
      teaser={teaser}
      expandLabel="Read full description"
    >
      {children}
    </EntityIntroDisclosure>
  );
}

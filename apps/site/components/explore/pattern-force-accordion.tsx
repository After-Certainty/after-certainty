"use client";

import Link from "next/link";

import { ExploreObservatoryFocusLink } from "@/components/explore/explore-observatory-focus-link";
import { MobileDisclosure, MobileDisclosureGroup } from "@/components/ui/mobile-disclosure";
import { firstSentences } from "@/lib/explore/pattern-preview";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { OrganizingForce, Pattern } from "@/types/semanticGraph";

type ForceRow = {
  force: OrganizingForce;
  supports: Pattern[];
};

type PatternForceAccordionProps = {
  forces: readonly ForceRow[];
  className?: string;
};

/**
 * Master-pattern organizing forces: compact accordion on mobile;
 * always-expanded list from `md` (same content tree).
 */
export function PatternForceAccordion({ forces, className = "" }: PatternForceAccordionProps) {
  if (forces.length === 0) return null;

  return (
    <div className={`mt-6 ${className}`.trim()}>
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Organizing forces</p>
      <MobileDisclosureGroup type="multiple" className="mt-2 border-t border-border/35">
        {forces.map(({ force, supports }) => {
          const oneLiner = firstSentences(force.description, 1, 120);
          return (
            <MobileDisclosure
              key={force.id}
              id={`force-${force.slug}`}
              regionLabel={force.title}
              alwaysOpenFromMd
              className="border-b border-border/35"
              summaryClassName="flex min-h-11 w-full items-center gap-3 py-[var(--explore-row-py)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
              summary={
                <span className="block min-w-0 leading-tight">
                  <span className="block font-display text-base font-medium tracking-tight text-fg">
                    {force.title}
                  </span>
                  {oneLiner ? (
                    <span className="mt-0.5 block text-xs leading-snug text-muted">{oneLiner}</span>
                  ) : null}
                </span>
              }
              panelClassName="pb-4 md:pb-5 md:pt-4"
            >
              <p className="hidden font-display text-lg font-medium tracking-tight text-fg md:block">
                {force.title}
              </p>
              <p className="text-sm leading-relaxed text-muted md:mt-2">{force.description}</p>
              {supports.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {supports.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`${explorePaths.patterns}/${p.slug}`}
                        className="text-fg underline-offset-4 hover:underline"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3">
                <ExploreObservatoryFocusLink
                  kind="force"
                  slug={force.slug}
                  variant="secondary"
                />
              </p>
            </MobileDisclosure>
          );
        })}
      </MobileDisclosureGroup>
    </div>
  );
}

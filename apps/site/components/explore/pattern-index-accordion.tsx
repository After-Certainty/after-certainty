"use client";

import Link from "next/link";

import { MobileDisclosure, MobileDisclosureGroup } from "@/components/ui/mobile-disclosure";
import { patternIndexEyebrow, patternPreviewFields } from "@/lib/explore/pattern-preview";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { Pattern } from "@/types/semanticGraph";

type PatternIndexAccordionProps = {
  patterns: readonly Pattern[];
  className?: string;
};

/**
 * Mobile pattern list: compact single-open accordion rows.
 * Desktop catalog cards are rendered separately by the page.
 */
export function PatternIndexAccordion({ patterns, className = "" }: PatternIndexAccordionProps) {
  if (patterns.length === 0) return null;

  return (
    <MobileDisclosureGroup
      type="single"
      className={`border-t border-border/35 md:hidden ${className}`.trim()}
    >
      {patterns.map((pattern) => {
        const preview = patternPreviewFields(pattern);
        const eyebrow = patternIndexEyebrow(pattern);
        return (
          <MobileDisclosure
            key={pattern.id}
            id={pattern.slug}
            regionLabel={pattern.title}
            className="border-b border-border/35"
            summary={
              <span className="block leading-tight">
                <span className="text-[10px] uppercase tracking-[0.28em] text-accent">{eyebrow}</span>
                <span className="mt-0.5 block font-display text-base font-medium tracking-tight text-fg">
                  {pattern.title}
                </span>
              </span>
            }
            panelClassName="pb-3 pl-0 pr-1"
          >
            <div className="space-y-2 text-sm leading-snug text-muted">
              {preview.description ? <p>{preview.description}</p> : null}
              {preview.secondary && preview.secondaryLabel ? (
                <p>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-accent">
                    {preview.secondaryLabel}
                  </span>
                  <span className="mt-0.5 block text-muted">{preview.secondary}</span>
                </p>
              ) : null}
              <p>
                <Link
                  href={`${explorePaths.patterns}/${pattern.slug}`}
                  className="text-accent underline-offset-4 hover:underline"
                >
                  View pattern →
                </Link>
              </p>
            </div>
          </MobileDisclosure>
        );
      })}
    </MobileDisclosureGroup>
  );
}

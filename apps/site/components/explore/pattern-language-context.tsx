import Link from "next/link";

import { PatternForceAccordion } from "@/components/explore/pattern-force-accordion";
import {
  forcesInCycleOrder,
  getForceForPattern,
  getMasterPattern,
  patternRoleLabel,
  realityDynamicLabel,
  supportingPatternsForForce,
} from "@/lib/explore/pattern-language";
import { patternForceCycleLine } from "@/lib/explore/pattern-at-a-glance";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { GraphIndex } from "@/lib/graph/graph";
import type { Pattern } from "@/types/semanticGraph";

type PatternLanguageContextProps = {
  index: GraphIndex;
  pattern: Pattern;
};

/**
 * Compact pattern-language summary for detail pages.
 * Master force lists use PatternForceAccordion (mobile progressive disclosure).
 */
export function PatternLanguageContext({ index, pattern }: PatternLanguageContextProps) {
  const role = patternRoleLabel(pattern.patternRole);
  if (!role) return null;

  const force = getForceForPattern(index, pattern);
  const master = pattern.patternRole === "supporting" ? getMasterPattern(index) : null;
  const dynamic = realityDynamicLabel(pattern.realityDynamic);
  const isMaster = pattern.patternRole === "master";
  const cycleForces = isMaster ? forcesInCycleOrder(index) : [];
  const cycleLine = patternForceCycleLine(cycleForces.map((f) => f.title));
  const forceRows = cycleForces.map((f) => ({
    force: f,
    supports: supportingPatternsForForce(index, f.slug),
  }));

  return (
    <div className="mt-8 max-w-2xl border-t border-border/25 pt-6 text-sm leading-relaxed text-muted md:pt-8">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Pattern language</p>
      <ul className="mt-3 space-y-1.5">
        <li>
          <span className="text-fg">{role}</span>
          {pattern.editorialStatus === "provisional" ? (
            <span className="ml-2 text-xs uppercase tracking-wider text-muted">Provisional</span>
          ) : null}
        </li>
        {dynamic ? (
          <li>
            <span className="text-fg">{dynamic}</span>
            <span className="text-muted">
              {" "}
              — tends to {pattern.realityDynamic === "obscuring" ? "obscure" : "restore"} contact
              with reality
            </span>
          </li>
        ) : null}
        {force ? (
          <li>
            Organizing force:{" "}
            <Link
              href={`${explorePaths.patterns}?force=${encodeURIComponent(force.slug)}`}
              className="text-fg underline-offset-4 hover:underline"
            >
              {force.title}
            </Link>
          </li>
        ) : null}
        {master ? (
          <li>
            Master pattern:{" "}
            <Link
              href={`${explorePaths.patterns}/${master.slug}`}
              className="text-fg underline-offset-4 hover:underline"
            >
              {master.title}
            </Link>
          </li>
        ) : null}
        {cycleLine ? (
          <li>
            <span className="text-[10px] uppercase tracking-[0.22em] text-accent">Cycle</span>
            <span className="mt-0.5 block text-fg">{cycleLine}</span>
          </li>
        ) : null}
      </ul>

      {isMaster && forceRows.length > 0 ? <PatternForceAccordion forces={forceRows} /> : null}
    </div>
  );
}

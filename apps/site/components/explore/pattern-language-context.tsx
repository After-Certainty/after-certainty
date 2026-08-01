import Link from "next/link";
import type { GraphIndex } from "@/lib/graph/graph";
import {
  forcesInCycleOrder,
  getForceForPattern,
  getMasterPattern,
  patternRoleLabel,
  realityDynamicLabel,
  supportingPatternsForForce,
} from "@/lib/explore/pattern-language";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { Pattern } from "@/types/semanticGraph";

type PatternLanguageContextProps = {
  index: GraphIndex;
  pattern: Pattern;
};

export function PatternLanguageContext({ index, pattern }: PatternLanguageContextProps) {
  const role = patternRoleLabel(pattern.patternRole);
  if (!role) return null;

  const force = getForceForPattern(index, pattern);
  const master = pattern.patternRole === "supporting" ? getMasterPattern(index) : null;
  const dynamic = realityDynamicLabel(pattern.realityDynamic);
  const isMaster = pattern.patternRole === "master";
  const cycleForces = isMaster ? forcesInCycleOrder(index) : [];

  return (
    <div className="mt-8 max-w-2xl space-y-4 border-t border-border/25 pt-8 text-sm leading-relaxed text-muted">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Pattern language</p>
      <ul className="space-y-2">
        <li>
          <span className="text-fg">{role}</span>
          {pattern.editorialStatus === "provisional" ? (
            <span className="ml-2 text-xs uppercase tracking-wider text-muted">Provisional</span>
          ) : null}
        </li>
        {dynamic ? (
          <li>
            <span className="text-fg">{dynamic}</span>
            <span className="text-muted"> — tends to {pattern.realityDynamic === "obscuring" ? "obscure" : "restore"} contact with reality</span>
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
      </ul>

      {isMaster && cycleForces.length > 0 ? (
        <div className="space-y-4 pt-2">
          <p className="text-fg">Organizing forces</p>
          <ol className="space-y-4">
            {cycleForces.map((f) => {
              const supports = supportingPatternsForForce(index, f.slug);
              return (
                <li key={f.id}>
                  <p className="font-medium text-fg">{f.title}</p>
                  <p className="mt-1 text-muted">{f.description}</p>
                  {supports.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
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
                </li>
              );
            })}
          </ol>
          <p className="text-xs text-muted">
            Cycle: Perception shapes Power → Power stabilizes Time → Time thins Contact → Contact
            renews Perception. Reality answers back throughout.
          </p>
        </div>
      ) : null}
    </div>
  );
}

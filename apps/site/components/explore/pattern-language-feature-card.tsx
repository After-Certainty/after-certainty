import Link from "next/link";

import { DisclosureChevron } from "@/components/ui/disclosure-chevron";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { OrganizingForce, Pattern } from "@/types/semanticGraph";

type PatternLanguageFeatureCardProps = {
  master: Pattern;
  forces: readonly OrganizingForce[];
  activeForceSlug?: string | null;
};

/**
 * Compact featured card for the master pattern on the Patterns index.
 */
export function PatternLanguageFeatureCard({
  master,
  forces,
  activeForceSlug = null,
}: PatternLanguageFeatureCardProps) {
  const href = `${explorePaths.patterns}/${master.slug}`;

  return (
    <div className="mb-6 rounded-md border border-border/40 bg-bg-elevated/30 md:mb-10">
      <div className="space-y-3 px-4 py-3 md:px-5 md:py-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">
          After Certainty Pattern Language
        </p>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Master pattern</p>
        <Link
          href={href}
          className="group flex min-h-11 items-start justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="min-w-0">
            <span className="block font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent md:text-2xl">
              {master.title}
            </span>
            <span className="mt-1 block text-xs text-accent">View master pattern</span>
          </span>
          <DisclosureChevron expanded={false} direction="right" className="mt-1" />
        </Link>

        {forces.length > 0 ? (
          <ul className="flex flex-wrap gap-2 pt-1 text-sm md:gap-3" aria-label="Organizing forces">
            <li>
              <Link
                href={explorePaths.patterns}
                className={`inline-flex min-h-11 items-center rounded-sm border px-2.5 underline-offset-4 hover:underline ${
                  activeForceSlug
                    ? "border-border/40 text-muted"
                    : "border-accent/40 text-fg"
                }`}
              >
                All
              </Link>
            </li>
            {forces.map((force) => {
              const active = activeForceSlug === force.slug;
              return (
                <li key={force.id}>
                  <Link
                    href={`${explorePaths.patterns}?force=${encodeURIComponent(force.slug)}`}
                    className={`inline-flex min-h-11 items-center rounded-sm border px-2.5 underline-offset-4 hover:underline ${
                      active
                        ? "border-accent/40 text-fg"
                        : "border-border/40 text-muted"
                    }`}
                  >
                    {force.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

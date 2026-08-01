import type { Metadata } from "next";
import Link from "next/link";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { ExplorePatternsPlaylistCallout } from "@/components/explore/explore-patterns-playlist-callout";
import { PatternCard } from "@/components/explore/pattern-card";
import { Section } from "@/components/ui/section";
import {
  forcesInCycleOrder,
  getMasterPattern,
  isPatternLanguagePattern,
  supportingPatternsForForce,
} from "@/lib/explore/pattern-language";
import { patternsSortedForExploreIndex } from "@/lib/explore/explore-patterns-order";
import { buildGraphIndex } from "@/lib/graph/graph";
import { explorePaths } from "@/lib/graph/explorePaths";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Patterns",
  description:
    "Patterns in the After Certainty semantic graph — systemic structures linked to concepts and books.",
});

type PageProps = {
  searchParams?: Promise<{ force?: string }>;
};

export default async function ExplorePatternsIndexPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const forceFilter = typeof sp.force === "string" ? sp.force.trim() : "";
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const patterns = patternsSortedForExploreIndex(graph.patterns);
  const master = getMasterPattern(index);
  const forces = forcesInCycleOrder(index);
  const languagePatterns = patterns.filter(isPatternLanguagePattern);
  const otherPatterns = patterns.filter((p) => !isPatternLanguagePattern(p));
  const activeForce = forceFilter ? index.forceBySlug.get(forceFilter) : null;
  const filteredSupports = activeForce
    ? supportingPatternsForForce(index, activeForce.slug)
    : [];

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Structures"
        title="Patterns"
        headingId="explore-patterns-heading"
        lede="Directional, recurring forms — each pattern links back into concepts and volumes as living language."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-14 md:py-20">
        <ExplorePatternsPlaylistCallout books={graph.books} />

        {forces.length > 0 && master ? (
          <div className="mb-14 max-w-3xl space-y-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent">
              After Certainty Pattern Language
            </p>
            <p className="text-muted">
              Master pattern:{" "}
              <Link
                href={`${explorePaths.patterns}/${master.slug}`}
                className="text-fg underline-offset-4 hover:underline"
              >
                {master.title}
              </Link>
            </p>
            <ul className="flex flex-wrap gap-3 text-sm">
              <li>
                <Link
                  href={explorePaths.patterns}
                  className={
                    activeForce
                      ? "text-muted underline-offset-4 hover:underline"
                      : "text-fg underline-offset-4 hover:underline"
                  }
                >
                  All forces
                </Link>
              </li>
              {forces.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`${explorePaths.patterns}?force=${encodeURIComponent(f.slug)}`}
                    className={
                      activeForce?.slug === f.slug
                        ? "text-fg underline-offset-4 hover:underline"
                        : "text-muted underline-offset-4 hover:underline"
                    }
                  >
                    {f.title}
                  </Link>
                </li>
              ))}
            </ul>
            {activeForce ? (
              <p className="text-sm text-muted">{activeForce.description}</p>
            ) : null}
          </div>
        ) : null}

        {patterns.length === 0 ? (
          <p className="text-muted">No patterns are published in the manifest yet.</p>
        ) : activeForce ? (
          <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSupports.map((p) => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </div>
        ) : (
          <div className="space-y-14">
            {languagePatterns.length > 0 ? (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
                  After Certainty Pattern Language
                </h2>
                <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {languagePatterns.map((p) => (
                    <PatternCard key={p.id} pattern={p} />
                  ))}
                </div>
              </div>
            ) : null}
            {otherPatterns.length > 0 ? (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
                  Portfolio patterns
                </h2>
                <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {otherPatterns.map((p) => (
                    <PatternCard key={p.id} pattern={p} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Section>
    </article>
  );
}

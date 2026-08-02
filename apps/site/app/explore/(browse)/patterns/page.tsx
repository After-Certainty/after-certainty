import type { Metadata } from "next";
import Link from "next/link";
import { exploreIndexCatalogGridClassName } from "@/components/explore/explore-catalog-card";
import { ExploreIndexGroup } from "@/components/explore/explore-index-group";
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

function patternCountLabel(count: number): string {
  return `${count} ${count === 1 ? "pattern" : "patterns"}`;
}

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
      <Section atmosphere="transition" className="border-t border-border/25 py-10 md:py-20">
        <ExplorePatternsPlaylistCallout books={graph.books} />

        {forces.length > 0 && master ? (
          <div className="mb-10 max-w-3xl space-y-4 md:mb-14">
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
            <ul className="flex flex-wrap gap-2 text-sm md:gap-3">
              <li>
                <Link
                  href={explorePaths.patterns}
                  className={`inline-flex min-h-11 items-center underline-offset-4 hover:underline ${
                    activeForce ? "text-muted" : "text-fg"
                  }`}
                >
                  All forces
                </Link>
              </li>
              {forces.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`${explorePaths.patterns}?force=${encodeURIComponent(f.slug)}`}
                    className={`inline-flex min-h-11 items-center underline-offset-4 hover:underline ${
                      activeForce?.slug === f.slug ? "text-fg" : "text-muted"
                    }`}
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
          <div className={exploreIndexCatalogGridClassName}>
            {filteredSupports.map((p) => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </div>
        ) : (
          <div className="space-y-0 md:space-y-14">
            {languagePatterns.length > 0 ? (
              <ExploreIndexGroup
                id="pattern-language"
                title="After Certainty Pattern Language"
                countLabel={patternCountLabel(languagePatterns.length)}
                defaultOpen
              >
                <div className={exploreIndexCatalogGridClassName}>
                  {languagePatterns.map((p) => (
                    <PatternCard key={p.id} pattern={p} />
                  ))}
                </div>
              </ExploreIndexGroup>
            ) : null}
            {otherPatterns.length > 0 ? (
              <ExploreIndexGroup
                id="portfolio-patterns"
                title="Portfolio patterns"
                countLabel={patternCountLabel(otherPatterns.length)}
              >
                <div className={exploreIndexCatalogGridClassName}>
                  {otherPatterns.map((p) => (
                    <PatternCard key={p.id} pattern={p} />
                  ))}
                </div>
              </ExploreIndexGroup>
            ) : null}
          </div>
        )}
      </Section>
    </article>
  );
}

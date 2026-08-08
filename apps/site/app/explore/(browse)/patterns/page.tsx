import type { Metadata } from "next";
import { ExploreIndexGroup } from "@/components/explore/explore-index-group";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { ExplorePatternsGameCallout } from "@/components/explore/explore-patterns-game-callout";
import { ExplorePatternsPlaylistCallout } from "@/components/explore/explore-patterns-playlist-callout";
import { PatternCard } from "@/components/explore/pattern-card";
import { PatternIndexAccordion } from "@/components/explore/pattern-index-accordion";
import { PatternLanguageFeatureCard } from "@/components/explore/pattern-language-feature-card";
import { Section } from "@/components/ui/section";
import {
  forcesInCycleOrder,
  getMasterPattern,
  isPatternLanguagePattern,
  supportingPatternsForForce,
} from "@/lib/explore/pattern-language";
import { patternsSortedForExploreIndex } from "@/lib/explore/explore-patterns-order";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";
import type { Pattern } from "@/types/semanticGraph";

export const metadata: Metadata = createPageMetadata({
  title: "Patterns",
  description:
    "Patterns in the After Certainty semantic graph — systemic structures linked to concepts and books.",
});

type PageProps = {
  searchParams?: Promise<{ force?: string }>;
};

/** Desktop-only catalog grid (mobile uses PatternIndexAccordion). */
const patternDesktopGridClassName =
  "hidden min-w-0 grid-cols-1 gap-3 md:grid md:grid-cols-2 md:gap-5 xl:grid-cols-3";

function patternCountLabel(count: number): string {
  return `${count} ${count === 1 ? "pattern" : "patterns"}`;
}

function PatternCatalog({ patterns }: { patterns: readonly Pattern[] }) {
  return (
    <>
      <PatternIndexAccordion patterns={patterns} />
      <div className={patternDesktopGridClassName}>
        {patterns.map((p) => (
          <PatternCard key={p.id} pattern={p} />
        ))}
      </div>
    </>
  );
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
  const filteredSupports = activeForce ? supportingPatternsForForce(index, activeForce.slug) : [];

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Structures"
        title="Patterns"
        headingId="explore-patterns-heading"
        density="editorial"
        countLabel={patternCountLabel(patterns.length)}
        lede="Directional, recurring forms — each pattern links back into concepts and volumes as living language."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-6 md:py-16">
        <ExplorePatternsGameCallout />
        <ExplorePatternsPlaylistCallout books={graph.books} />

        {master ? (
          <PatternLanguageFeatureCard
            master={master}
            forces={forces}
            activeForceSlug={activeForce?.slug ?? null}
          />
        ) : null}

        {activeForce ? (
          <p className="mb-4 max-w-2xl text-sm text-muted md:mb-6">{activeForce.description}</p>
        ) : null}

        {patterns.length === 0 ? (
          <p className="text-muted">No patterns are published in the manifest yet.</p>
        ) : activeForce ? (
          <PatternCatalog patterns={filteredSupports} />
        ) : (
          <div className="space-y-0 md:space-y-14">
            {languagePatterns.length > 0 ? (
              <ExploreIndexGroup
                id="pattern-language"
                title="After Certainty Pattern Language"
                countLabel={patternCountLabel(languagePatterns.length)}
                defaultOpen
              >
                <PatternCatalog patterns={languagePatterns} />
              </ExploreIndexGroup>
            ) : null}
            {otherPatterns.length > 0 ? (
              <ExploreIndexGroup
                id="portfolio-patterns"
                title="Portfolio patterns"
                countLabel={patternCountLabel(otherPatterns.length)}
              >
                <PatternCatalog patterns={otherPatterns} />
              </ExploreIndexGroup>
            ) : null}
          </div>
        )}
      </Section>
    </article>
  );
}

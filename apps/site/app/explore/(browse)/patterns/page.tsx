import type { Metadata } from "next";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { PatternCard } from "@/components/explore/pattern-card";
import { Section } from "@/components/ui/section";
import { patternsSortedForExploreIndex } from "@/lib/explore/explore-patterns-order";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Patterns",
  description: "Patterns in the After Certainty semantic graph — systemic structures linked to concepts and books.",
});

export default async function ExplorePatternsIndexPage() {
  const { graph } = await getExploreSemanticGraph();
  const patterns = patternsSortedForExploreIndex(graph.patterns);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Structures"
        title="Patterns"
        headingId="explore-patterns-heading"
        lede="Directional, recurring forms — each pattern links back into concepts and volumes as living language."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-14 md:py-20">
        {patterns.length === 0 ? (
          <p className="text-muted">No patterns are published in the manifest yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {patterns.map((p) => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </div>
        )}
      </Section>
    </article>
  );
}

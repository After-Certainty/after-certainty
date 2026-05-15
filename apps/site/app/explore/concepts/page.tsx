import type { Metadata } from "next";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { ConceptCard } from "@/components/explore/concept-card";
import { Section } from "@/components/ui/section";
import { conceptsSortedForExploreIndex } from "@/lib/explore/explore-concepts-order";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Concepts",
  description: "Glossary concepts in the After Certainty semantic graph — definitions and traversable relationships.",
});

export default async function ExploreConceptsIndexPage() {
  const graph = await getSemanticGraph();
  const concepts = conceptsSortedForExploreIndex(graph.glossary);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Glossary"
        title="Concepts"
        headingId="explore-concepts-heading"
        lede="Each entry is a coordinate in the atlas — open one to move along relationships, patterns, books, and thinkers."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-14 md:py-20">
        {concepts.length === 0 ? (
          <p className="text-muted">No concepts are published in the manifest yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {concepts.map((c) => (
              <ConceptCard key={c.id} concept={c} />
            ))}
          </div>
        )}
      </Section>
    </article>
  );
}

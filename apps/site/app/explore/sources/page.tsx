import type { Metadata } from "next";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { SourceCard } from "@/components/explore/source-card";
import { Section } from "@/components/ui/section";
import { sourcesSortedForExploreIndex } from "@/lib/explore/explore-sources-order";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Thinkers & sources",
  description: "Thinkers and sources in the After Certainty semantic graph — intellectual lineages and cross-links.",
});

export default async function ExploreSourcesIndexPage() {
  const graph = await getSemanticGraph();
  const sources = sourcesSortedForExploreIndex(graph.sources);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Voices"
        title="Thinkers & sources"
        headingId="explore-sources-heading"
        lede="Philosophers, social scientists, and practitioners — positioned by how the graph touches their ideas."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-14 md:py-20">
        {sources.length === 0 ? (
          <p className="text-muted">No sources are published in the manifest yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sources.map((s) => (
              <SourceCard key={s.id} source={s} />
            ))}
          </div>
        )}
      </Section>
    </article>
  );
}

import type { Metadata } from "next";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { SourceCard } from "@/components/explore/source-card";
import { Section } from "@/components/ui/section";
import { sourcesSortedForExploreIndex } from "@/lib/explore/explore-sources-order";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Sources",
  description:
    "Bibliographic sources in the After Certainty semantic graph — books, articles, reports, and other research works.",
});

export default async function ExploreSourcesIndexPage() {
  const { graph } = await getExploreSemanticGraph();
  const sources = sourcesSortedForExploreIndex(graph.sources);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Works"
        title="Sources"
        headingId="explore-sources-heading"
        lede="Books, articles, reports, and other research works — bibliographic entries linked across the graph."
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

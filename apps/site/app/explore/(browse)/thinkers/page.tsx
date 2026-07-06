import type { Metadata } from "next";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { ThinkerCard } from "@/components/explore/thinker-card";
import { Section } from "@/components/ui/section";
import { thinkersSortedForExploreIndex } from "@/lib/explore/explore-thinkers-order";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Thinkers",
  description:
    "People and institutions in the After Certainty semantic graph — intellectual voices anchored to works, concepts, and books.",
});

export default async function ExploreThinkersIndexPage() {
  const { graph } = await getExploreSemanticGraph();
  const thinkers = thinkersSortedForExploreIndex(graph);

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Voices"
        title="Thinkers"
        headingId="explore-thinkers-heading"
        lede="Philosophers, social scientists, and institutions — grouped as people and organizations rather than individual bibliographic works."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-14 md:py-20">
        {thinkers.length === 0 ? (
          <p className="text-muted">No thinkers are published in the manifest yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {thinkers.map((thinker) => (
              <ThinkerCard key={thinker.id} thinker={thinker} />
            ))}
          </div>
        )}
      </Section>
    </article>
  );
}

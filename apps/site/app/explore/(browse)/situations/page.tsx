import type { Metadata } from "next";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { SituationCard } from "@/components/explore/situation-card";
import { Section } from "@/components/ui/section";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Situations",
  description:
    "Situations in the After Certainty semantic graph — lived scenarios where patterns and concepts show up together.",
});

export default async function ExploreSituationsIndexPage() {
  const { graph } = await getExploreSemanticGraph();
  const situations = [...(graph.situations ?? [])].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  );

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Lived terrain"
        title="Situations"
        headingId="explore-situations-heading"
        lede="Concrete scenarios where patterns take hold — recognition signals, active structures, and paths back toward correction."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-14 md:py-20">
        {situations.length === 0 ? (
          <p className="text-muted">No situations are published in the manifest yet.</p>
        ) : (
          <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {situations.map((situation) => (
              <SituationCard key={situation.id} situation={situation} />
            ))}
          </div>
        )}
      </Section>
    </article>
  );
}

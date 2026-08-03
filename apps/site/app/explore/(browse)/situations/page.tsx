import type { Metadata } from "next";
import { exploreIndexCatalogGridClassName } from "@/components/explore/explore-catalog-card";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { SituationCard } from "@/components/explore/situation-card";
import { Section } from "@/components/ui/section";
import { exploreIndexCountLabel } from "@/lib/explore/explore-index-browse";
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
        density="editorial"
        countLabel={exploreIndexCountLabel(situations.length, "situation")}
        lede="Concrete scenarios where patterns take hold — recognition signals, active structures, and paths back toward correction."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-6 md:py-16">
        {situations.length === 0 ? (
          <p className="text-muted">No situations are published in the manifest yet.</p>
        ) : (
          <div className={exploreIndexCatalogGridClassName}>
            {situations.map((situation) => (
              <SituationCard key={situation.id} situation={situation} />
            ))}
          </div>
        )}
      </Section>
    </article>
  );
}

import type { Thinker } from "@/types/semanticGraph";
import {
  ExploreCatalogCard,
  type ExploreCatalogCardLayout,
} from "@/components/explore/explore-catalog-card";
import { explorePaths } from "@/lib/graph/explorePaths";

type ThinkerCardProps = {
  thinker: Thinker;
  layout?: ExploreCatalogCardLayout;
};

function thinkerTypeLabel(type: Thinker["type"]): string {
  return type === "organization" ? "Organization" : "Person";
}

export function ThinkerCard({ thinker, layout = "responsive" }: ThinkerCardProps) {
  const description = thinker.summary ?? thinker.whyThisMatters;

  return (
    <ExploreCatalogCard
      href={`${explorePaths.thinkers}/${thinker.slug}`}
      eyebrow={thinkerTypeLabel(thinker.type)}
      title={thinker.name}
      blurb={description}
      ctaLabel="View Thinker →"
      layout={layout}
    />
  );
}

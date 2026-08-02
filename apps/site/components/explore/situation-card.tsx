import type { Situation } from "@/types/semanticGraph";
import {
  ExploreCatalogCard,
  type ExploreCatalogCardLayout,
} from "@/components/explore/explore-catalog-card";
import { explorePaths } from "@/lib/graph/explorePaths";

type SituationCardProps = {
  situation: Situation;
  layout?: ExploreCatalogCardLayout;
};

export function SituationCard({ situation, layout = "responsive" }: SituationCardProps) {
  return (
    <ExploreCatalogCard
      href={`${explorePaths.situations}/${situation.slug}`}
      eyebrow="Situation"
      title={situation.title}
      blurb={situation.summary}
      ctaLabel="View Situation →"
      layout={layout}
    />
  );
}

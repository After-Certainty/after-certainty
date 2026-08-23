import type { GlossaryConcept } from "@/types/semanticGraph";
import {
  ExploreCatalogCard,
  type ExploreCatalogCardLayout,
} from "@/components/explore/explore-catalog-card";
import { explorePaths } from "@/lib/graph/explorePaths";
import { getConceptDisplayDefinition } from "@/lib/graph/presentation/conceptFormatting";

type ConceptCardProps = {
  concept: GlossaryConcept;
  layout?: ExploreCatalogCardLayout;
};

export function ConceptCard({ concept, layout = "responsive" }: ConceptCardProps) {
  return (
    <ExploreCatalogCard
      href={`${explorePaths.concepts}/${concept.slug}`}
      eyebrow="Concept"
      title={concept.title}
      blurb={getConceptDisplayDefinition(concept)}
      ctaLabel="View Concept →"
      layout={layout}
      appearance="plain"
    />
  );
}

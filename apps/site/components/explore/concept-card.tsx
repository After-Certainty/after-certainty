import Link from "next/link";
import type { GlossaryConcept } from "@/types/semanticGraph";
import { ExploreCard } from "@/components/explore/explore-card";
import { explorePaths } from "@/lib/graph/explorePaths";
import { getConceptDisplayDefinition } from "@/lib/graph/conceptFormatting";

type ConceptCardProps = {
  concept: GlossaryConcept;
};

export function ConceptCard({ concept }: ConceptCardProps) {
  return (
    <ExploreCard className="!bg-transparent !shadow-none !backdrop-blur-none">
      <Link href={`${explorePaths.concepts}/${concept.slug}`} className="block space-y-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent">Concept</p>
        <h3 className="font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
          {concept.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{getConceptDisplayDefinition(concept)}</p>
      </Link>
    </ExploreCard>
  );
}

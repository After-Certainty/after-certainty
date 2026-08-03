import type { GlossaryConcept } from "@/types/semanticGraph";

import { ConceptCard } from "@/components/explore/concept-card";
import { RelatedSectionDisclosure } from "@/components/explore/related-section-disclosure";

type RelatedConceptsSectionProps = {
  concepts: readonly GlossaryConcept[];
  className?: string;
};

function conceptCountLabel(count: number): string {
  return `${count} ${count === 1 ? "concept" : "concepts"}`;
}

/**
 * Related concepts for pattern detail: collapsed with count on mobile;
 * open grid from `md`. Cards stay separate links inside the panel.
 */
export function RelatedConceptsSection({
  concepts,
  className = "",
}: RelatedConceptsSectionProps) {
  if (concepts.length === 0) return null;

  return (
    <RelatedSectionDisclosure
      id="related-concepts"
      title="Related concepts"
      countLabel={conceptCountLabel(concepts.length)}
      className={className}
    >
      <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        {concepts.map((concept) => (
          <li key={concept.id} className="min-w-0">
            <ConceptCard concept={concept} layout="compact" />
          </li>
        ))}
      </ul>
    </RelatedSectionDisclosure>
  );
}

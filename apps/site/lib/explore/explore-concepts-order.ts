import type { GlossaryConcept } from "@/types/semanticGraph";

/** Same order as `/explore/concepts` (title, `localeCompare`). */
export function conceptsSortedForExploreIndex(graphGlossary: readonly GlossaryConcept[]): GlossaryConcept[] {
  return [...graphGlossary].sort((a, b) => a.title.localeCompare(b.title));
}

export function exploreConceptAdjacentInIndexOrder(
  sortedConcepts: readonly GlossaryConcept[],
  slug: string,
): { prev?: GlossaryConcept; next?: GlossaryConcept } {
  const i = sortedConcepts.findIndex((c) => c.slug === slug);
  if (i < 0) return {};
  return {
    prev: i > 0 ? sortedConcepts[i - 1] : undefined,
    next: i < sortedConcepts.length - 1 ? sortedConcepts[i + 1] : undefined,
  };
}

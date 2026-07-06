import { resolveThinkers } from "@/lib/graph/thinkers";
import type { SemanticGraph, Thinker } from "@/types/semanticGraph";

/** Same order as `/explore/thinkers` (`name`, `localeCompare`). */
export function thinkersSortedForExploreIndex(graph: SemanticGraph): Thinker[] {
  return [...resolveThinkers(graph)].sort((a, b) => a.name.localeCompare(b.name));
}

export function exploreThinkerAdjacentInIndexOrder(
  sortedThinkers: readonly Thinker[],
  slug: string,
): { prev?: Thinker; next?: Thinker } {
  const i = sortedThinkers.findIndex((t) => t.slug === slug);
  if (i < 0) return {};
  return {
    prev: i > 0 ? sortedThinkers[i - 1] : undefined,
    next: i < sortedThinkers.length - 1 ? sortedThinkers[i + 1] : undefined,
  };
}

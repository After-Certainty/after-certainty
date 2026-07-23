import type { Source } from "@/types/semanticGraph";

/** Same order as `/explore/sources` (`name`, `localeCompare`). */
export function sourcesSortedForExploreIndex(graphSources: readonly Source[]): Source[] {
  return [...graphSources].sort((a, b) => a.name.localeCompare(b.name));
}

export function exploreSourceAdjacentInIndexOrder(
  sortedSources: readonly Source[],
  slug: string,
): { prev?: Source; next?: Source } {
  const i = sortedSources.findIndex((s) => s.slug === slug);
  if (i < 0) return {};
  return {
    prev: i > 0 ? sortedSources[i - 1] : undefined,
    next: i < sortedSources.length - 1 ? sortedSources[i + 1] : undefined,
  };
}

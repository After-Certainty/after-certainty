import type { Pattern } from "@/types/semanticGraph";

/** Same order as `/explore/patterns` (title, `localeCompare`). */
export function patternsSortedForExploreIndex(graphPatterns: readonly Pattern[]): Pattern[] {
  return [...graphPatterns].sort((a, b) => a.title.localeCompare(b.title));
}

export function explorePatternAdjacentInIndexOrder(
  sortedPatterns: readonly Pattern[],
  slug: string,
): { prev?: Pattern; next?: Pattern } {
  const i = sortedPatterns.findIndex((p) => p.slug === slug);
  if (i < 0) return {};
  return {
    prev: i > 0 ? sortedPatterns[i - 1] : undefined,
    next: i < sortedPatterns.length - 1 ? sortedPatterns[i + 1] : undefined,
  };
}

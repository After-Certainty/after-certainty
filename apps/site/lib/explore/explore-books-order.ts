import type { Book } from "@/types/semanticGraph";

/** Same order as `/explore/books` (title, `localeCompare`). */
export function booksSortedForExploreIndex(graphBooks: readonly Book[]): Book[] {
  return [...graphBooks].sort((a, b) => a.title.localeCompare(b.title));
}

export function exploreBookAdjacentInIndexOrder(
  sortedBooks: readonly Book[],
  slug: string,
): { prev?: Book; next?: Book } {
  const i = sortedBooks.findIndex((b) => b.slug === slug);
  if (i < 0) return {};
  return {
    prev: i > 0 ? sortedBooks[i - 1] : undefined,
    next: i < sortedBooks.length - 1 ? sortedBooks[i + 1] : undefined,
  };
}

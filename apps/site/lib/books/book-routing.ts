import { explorePaths } from "@/lib/graph/explorePaths";

/** Canonical on-site URL for a book in explore. */
export function getBookDetailHref(slug: string): string {
  return `${explorePaths.books}/${slug}`;
}

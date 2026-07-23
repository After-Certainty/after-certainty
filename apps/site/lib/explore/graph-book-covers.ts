import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import type { Book } from "@/types/semanticGraph";

export function buildCoverImageBySlugLookup(books: readonly Book[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const b of books) {
    if (b.coverImage) {
      map.set(b.slug, b.coverImage);
      for (const alias of b.slugAliases ?? []) {
        map.set(alias, b.coverImage);
      }
    }
  }
  return map;
}

export function resolveCoverForGraphBookSlug(
  lookup: Map<string, string>,
  books: readonly Book[],
  graphSlug: string,
): string | undefined {
  const direct = lookup.get(graphSlug);
  if (direct) return direct;
  const canonical = resolveBookCanonicalSlug(graphSlug, books);
  if (canonical) return lookup.get(canonical);
  return undefined;
}

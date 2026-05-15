import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";
import type { Book as CatalogBook } from "@/types/content";

/** Map catalog slug and slug aliases to cover image URL/path. */
export function buildCoverImageBySlugLookup(catalogBooks: CatalogBook[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const b of catalogBooks) {
    if (!b.coverImage) continue;
    map.set(b.slug, b.coverImage);
    for (const a of b.slugAliases ?? []) {
      map.set(a, b.coverImage);
    }
  }
  return map;
}

/** Resolve a cover for a graph book using catalog entries (slug + aliases + canonical slug). */
export function resolveCoverForGraphBookSlug(
  coverBySlug: ReadonlyMap<string, string>,
  catalogBooks: CatalogBook[],
  graphSlug: string,
): string | undefined {
  const direct = coverBySlug.get(graphSlug);
  if (direct) return direct;
  const canonical = resolveBookCanonicalSlug(graphSlug, catalogBooks);
  if (canonical) return coverBySlug.get(canonical);
  return undefined;
}

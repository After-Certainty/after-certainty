import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";
import type { Book as CatalogBook } from "@/types/content";
import type { Book as SemanticBook, SemanticGraph } from "@/types/semanticGraph";

function mergeBookFields(existing: SemanticBook, c: CatalogBook): SemanticBook {
  return {
    ...existing,
    title: existing.title || c.title,
    subtitle: existing.subtitle ?? c.subtitle ?? undefined,
    summary: existing.summary ?? c.description ?? undefined,
    coverImage: existing.coverImage ?? c.coverImage ?? undefined,
  };
}

function catalogOnlySemanticBook(canonicalSlug: string, c: CatalogBook): SemanticBook {
  return {
    id: `catalog:${canonicalSlug}`,
    slug: canonicalSlug,
    title: c.title,
    subtitle: c.subtitle ?? undefined,
    summary: c.description,
    coverImage: c.coverImage ?? undefined,
    concepts: [],
    patterns: [],
    sources: [],
  };
}

/**
 * Merges `books-manifest` catalog rows into the semantic graph so the observatory (and
 * other explore surfaces) can show every published volume, not only books explicitly
 * duplicated in `semantic-manifest.json`.
 *
 * Manifest rows are keyed by **their own slug** so multiple editions (e.g. v1 and v2)
 * are not collapsed when they share a catalog canonical slug. Catalog metadata is merged
 * into every manifest row whose slug resolves to the same canonical as that catalog row.
 */
export function mergeCatalogBooksIntoSemanticGraph(
  graph: SemanticGraph,
  catalogBooks: CatalogBook[],
): SemanticGraph {
  const bySlug = new Map<string, SemanticBook>();
  for (const b of graph.books) {
    bySlug.set(b.slug, { ...b });
  }

  const manifestSlugs = graph.books.map((b) => b.slug);

  for (const c of catalogBooks) {
    const canonical = resolveBookCanonicalSlug(c.slug, catalogBooks) ?? c.slug;

    const matchingManifestSlugs = manifestSlugs.filter(
      (slug) => (resolveBookCanonicalSlug(slug, catalogBooks) ?? slug) === canonical,
    );

    if (matchingManifestSlugs.length > 0) {
      for (const slug of matchingManifestSlugs) {
        const existing = bySlug.get(slug);
        if (existing) bySlug.set(slug, mergeBookFields(existing, c));
      }
    } else if (!bySlug.has(canonical)) {
      bySlug.set(canonical, catalogOnlySemanticBook(canonical, c));
    }
  }

  const books = [...bySlug.values()].sort((a, b) => a.title.localeCompare(b.title));
  return { ...graph, books };
}

import type { Book } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";
import { buildCoverImageBySlugLookup, resolveCoverForGraphBookSlug } from "@/lib/explore/graph-book-covers";

/** Per graph book slug: resolved cover (catalog + canonical slug rules) with manifest fallback. */
export function buildExploreCoverBySlug(graph: SemanticGraph, catalogBooks: Book[]): Record<string, string | undefined> {
  const coverLookup = buildCoverImageBySlugLookup(catalogBooks);
  const out: Record<string, string | undefined> = {};
  for (const b of graph.books) {
    out[b.slug] = resolveCoverForGraphBookSlug(coverLookup, catalogBooks, b.slug) ?? b.coverImage;
  }
  return out;
}

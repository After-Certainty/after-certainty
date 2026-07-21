import type { Book } from "@/types/semanticGraph";
import type { SemanticGraph } from "@/types/semanticGraph";
import {
  buildCoverImageBySlugLookup,
  resolveCoverForGraphBookSlug,
} from "@/lib/explore/graph-book-covers";

/** Per graph book slug: resolved cover with manifest fallback. */
export function buildExploreCoverBySlug(
  graph: SemanticGraph,
  books: Book[],
): Record<string, string | undefined> {
  const coverLookup = buildCoverImageBySlugLookup(books);
  const out: Record<string, string | undefined> = {};
  for (const b of graph.books) {
    out[b.slug] = resolveCoverForGraphBookSlug(coverLookup, books, b.slug) ?? b.coverImage;
  }
  return out;
}

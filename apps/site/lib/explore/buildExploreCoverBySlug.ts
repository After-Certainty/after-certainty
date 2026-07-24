import type { Book } from "@/types/semanticGraph";
import type { SemanticGraph } from "@/types/semanticGraph";
import { buildCoverImageBySlugLookup } from "@/lib/explore/graph-book-covers";

/** Per graph book slug: thumbnail cover for observatory / compact surfaces. */
export function buildExploreCoverBySlug(
  graph: SemanticGraph,
  books: Book[],
): Record<string, string | undefined> {
  const coverLookup = buildCoverImageBySlugLookup(books, "thumbnail");
  const out: Record<string, string | undefined> = {};
  for (const b of graph.books) {
    out[b.slug] = coverLookup.get(b.slug);
  }
  return out;
}

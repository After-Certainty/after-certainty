import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import { findBookBySlug } from "@/lib/books/book-metadata";
import { getSemanticGraph } from "@/lib/graph/manifest";
import type { Book } from "@/types/semanticGraph";

export async function getBookBySlugFromGraph(slug: string): Promise<Book | undefined> {
  const graph = await getSemanticGraph();
  const canonical = resolveBookCanonicalSlug(slug, graph.books);
  if (canonical === undefined) return findBookBySlug(slug, graph.books);
  return graph.books.find((book) => book.slug === canonical);
}

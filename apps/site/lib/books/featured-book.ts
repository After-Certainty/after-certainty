import { deriveFeaturedBookSlug } from "@/lib/books/book-slugs";
import { getSemanticGraph } from "@/lib/graph/manifest";
import type { Book } from "@/types/semanticGraph";

export async function getFeaturedBook(): Promise<Book | undefined> {
  const graph = await getSemanticGraph();
  const featuredSlug = deriveFeaturedBookSlug(graph.books);
  return graph.books.find((book) => book.slug === featuredSlug);
}

import { getBooks } from "@/lib/content-data";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { mergeCatalogBooksIntoSemanticGraph } from "@/lib/explore/mergeCatalogBooksIntoSemanticGraph";
import type { Book } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";

/**
 * Semantic graph as used across `/explore` — merges the release semantic manifest with
 * the books catalog so every catalog volume appears as a graph node (manifest rows
 * still win for ids and typed links).
 */
export async function getExploreSemanticGraph(): Promise<{
  graph: SemanticGraph;
  catalogBooks: Book[];
}> {
  const [rawGraph, catalogBooks] = await Promise.all([getSemanticGraph(), getBooks()]);
  const graph = mergeCatalogBooksIntoSemanticGraph(rawGraph, catalogBooks);
  return { graph, catalogBooks };
}

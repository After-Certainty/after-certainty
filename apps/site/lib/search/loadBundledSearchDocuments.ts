import booksManifest from "@/data/books-manifest.json";
import podcastFallback from "@/data/podcast-episodes.json";
import fallbackSemantic from "@/data/semantic-manifest.json";
import { mergeCatalogBooksIntoSemanticGraph } from "@/lib/explore/mergeCatalogBooksIntoSemanticGraph";
import { semanticGraphSchema, toSemanticGraph } from "@/lib/graph/schemas";
import { getSearchAliasConfig } from "@/lib/search/aliases";
import { buildSearchDocuments } from "@/lib/search/buildSearchDocuments";
import type { SearchDocument } from "@/lib/search/types";
import type { Book as CatalogBook, PodcastEpisode } from "@/types/content";

/** Offline corpus for tests and budgets — mirrors the Explore merge path. */
export function loadBundledSearchDocuments(): SearchDocument[] {
  const rawGraph = toSemanticGraph(semanticGraphSchema.parse(fallbackSemantic));
  const catalogBooks = booksManifest.books as CatalogBook[];
  const graph = mergeCatalogBooksIntoSemanticGraph(rawGraph, catalogBooks);
  const podcastEpisodes = podcastFallback.episodes as PodcastEpisode[];

  return buildSearchDocuments({
    graph,
    catalogBooks,
    podcastEpisodes,
    aliasConfig: getSearchAliasConfig(),
  });
}

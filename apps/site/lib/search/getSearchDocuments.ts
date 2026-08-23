import { cache } from "react";

import { getPodcastEpisodesFromRss } from "@/lib/podcast/rss";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { getSearchAliasConfigFromGraph } from "@/lib/search/aliases";
import { buildSearchDocuments } from "@/lib/search/buildSearchDocuments";
import type { SearchDocument } from "@/lib/search/types";

/**
 * Load the live explore corpus + podcast feed and normalize to search documents.
 * Uses the same ISR-backed loaders as Explore (no second source of truth).
 * Cached per request via React `cache()`.
 */
export const getSearchDocuments = cache(async (): Promise<SearchDocument[]> => {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodesFromRss(),
  ]);

  return buildSearchDocuments({
    graph,
    podcastEpisodes,
    aliasConfig: getSearchAliasConfigFromGraph(graph),
  });
});

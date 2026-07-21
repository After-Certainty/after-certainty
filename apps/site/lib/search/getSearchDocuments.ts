import { cache } from "react";

import { getPodcastEpisodes } from "@/lib/content-data";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { getSearchAliasConfig } from "@/lib/search/aliases";
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
    getPodcastEpisodes(),
  ]);

  return buildSearchDocuments({
    graph,
    podcastEpisodes,
    aliasConfig: getSearchAliasConfig(),
  });
});

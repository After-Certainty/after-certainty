import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { getSearchAliasConfigFromGraph } from "@/lib/search/aliases";
import { getSearchDocuments } from "@/lib/search/getSearchDocuments";
import type { SearchAliasConfig, SearchDocument } from "@/lib/search/types";

/** Wire format for `GET /api/search/index`. */
export type SearchIndexPayload = {
  version: 1;
  generatedAt: string;
  documentCount: number;
  documents: SearchDocument[];
  /** Authored alias/related bridge — public vocabulary, not a second corpus. */
  aliasConfig: SearchAliasConfig;
};

export function buildSearchIndexPayload(
  documents: readonly SearchDocument[],
  aliasConfig: SearchAliasConfig,
  generatedAt: string = new Date().toISOString(),
): SearchIndexPayload {
  return {
    version: 1,
    generatedAt,
    documentCount: documents.length,
    documents: [...documents],
    aliasConfig,
  };
}

/** Build the searchable index payload from the same-checkout semantic graph. */
export async function getSearchIndexPayload(): Promise<SearchIndexPayload> {
  const [{ graph }, documents] = await Promise.all([
    getExploreSemanticGraph(),
    getSearchDocuments(),
  ]);
  return buildSearchIndexPayload(documents, getSearchAliasConfigFromGraph(graph));
}

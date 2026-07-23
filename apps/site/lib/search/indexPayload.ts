import { getSearchAliasConfig } from "@/lib/search/aliases";
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
  aliasConfig: SearchAliasConfig = getSearchAliasConfig(),
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

/** Build the searchable index payload from live ISR loaders. */
export async function getSearchIndexPayload(): Promise<SearchIndexPayload> {
  const documents = await getSearchDocuments();
  return buildSearchIndexPayload(documents, getSearchAliasConfig());
}

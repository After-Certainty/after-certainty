import MiniSearch from "minisearch";

import { prepareSearchQuery } from "@/lib/search/prepareQuery";
import type { SearchDocument, SearchEntityType } from "@/lib/search/types";

/** Fields MiniSearch indexes for matching. */
export const SEARCH_INDEX_FIELDS = [
  "title",
  "aliases",
  "subtitle",
  "description",
  "creatorNames",
  "relatedTitles",
  "themes",
  "slug",
  "searchText",
] as const;

const FIELD_BOOST: Record<(typeof SEARCH_INDEX_FIELDS)[number], number> = {
  title: 6,
  aliases: 5,
  subtitle: 2.5,
  description: 2,
  creatorNames: 3,
  relatedTitles: 1.4,
  themes: 1.4,
  slug: 2.5,
  searchText: 1,
};

function extractField(document: SearchDocument, fieldName: string): string {
  const value = document[fieldName as keyof SearchDocument];
  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

export type SearchEngine = {
  miniSearch: MiniSearch;
  documentsById: ReadonlyMap<string, SearchDocument>;
};

/** Build a MiniSearch engine over normalized search documents. */
export function createSearchEngine(documents: readonly SearchDocument[]): SearchEngine {
  const documentsById = new Map<string, SearchDocument>();
  for (const document of documents) {
    documentsById.set(document.id, document);
  }

  const miniSearch = new MiniSearch({
    idField: "id",
    fields: [...SEARCH_INDEX_FIELDS],
    // Keep boostWeight available to boostDocument without relying on stored arrays.
    storeFields: ["boostWeight", "entityType", "visibility"],
    extractField: (doc, fieldName) => extractField(doc as SearchDocument, fieldName),
  });
  miniSearch.addAll([...documents]);
  return { miniSearch, documentsById };
}

/** @deprecated Prefer createSearchEngine — kept as a thin alias for call sites. */
export function createMiniSearchIndex(documents: readonly SearchDocument[]): SearchEngine {
  return createSearchEngine(documents);
}

export type QuerySearchOptions = {
  /** Max hits to return (default 24). */
  limit?: number;
  /** Restrict to one or more entity types. */
  entityTypes?: readonly SearchEntityType[];
  /** Fuzzy coefficient; `false` disables (default 0.2). */
  fuzzy?: number | false;
  prefix?: boolean;
};

/**
 * Query a search engine with field boosts and document boostWeight.
 * Hydrates full documents from the original map (MiniSearch flattens arrays in storeFields).
 */
export function queryMiniSearch(
  engine: SearchEngine,
  query: string,
  options: QuerySearchOptions = {},
): Array<{ score: number; document: SearchDocument; terms: string[] }> {
  const prepared = prepareSearchQuery(query);
  if (!prepared.searchText) return [];

  const limit = options.limit ?? 24;
  const fuzzy = options.fuzzy === false ? false : (options.fuzzy ?? 0.2);
  const prefix = options.prefix ?? true;
  const typeFilter =
    options.entityTypes && options.entityTypes.length > 0 ? new Set(options.entityTypes) : null;

  const results = engine.miniSearch.search(prepared.searchText, {
    prefix,
    fuzzy,
    combineWith: prepared.combineWith,
    boost: FIELD_BOOST,
    boostDocument: (id, _term, storedFields) => {
      const fromStored = storedFields?.boostWeight;
      if (typeof fromStored === "number" && Number.isFinite(fromStored)) return fromStored;
      return engine.documentsById.get(String(id))?.boostWeight ?? 1;
    },
    filter: (result) => {
      const document = engine.documentsById.get(String(result.id));
      if (!document || document.visibility === "unlisted") return false;
      if (typeFilter && !typeFilter.has(document.entityType)) return false;
      return true;
    },
  });

  const out: Array<{ score: number; document: SearchDocument; terms: string[] }> = [];
  for (const result of results) {
    const document = engine.documentsById.get(String(result.id));
    if (!document) continue;
    out.push({
      score: result.score,
      document,
      terms: result.terms ?? [],
    });
    if (out.length >= limit) break;
  }
  return out;
}

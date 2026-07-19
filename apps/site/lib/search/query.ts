import { relatedTermsByTargetId } from "@/lib/search/aliases";
import { explainSearchMatch } from "@/lib/search/explanations";
import {
  createSearchEngine,
  queryMiniSearch,
  type QuerySearchOptions,
  type SearchEngine,
} from "@/lib/search/miniSearch";
import { prepareSearchQuery } from "@/lib/search/prepareQuery";
import { buildSearchSnippet, type SearchSnippet } from "@/lib/search/snippets";
import type { SearchAliasConfig, SearchDocument } from "@/lib/search/types";

export type SearchHit = {
  document: SearchDocument;
  score: number;
  explanations: string[];
  snippet: SearchSnippet | null;
};

export type RunSearchOptions = QuerySearchOptions & {
  aliasConfig?: SearchAliasConfig;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function relatedPhraseMultiplier(query: string, relatedTerms: readonly string[]): number {
  const q = normalize(query);
  if (!q) return 1;

  if (relatedTerms.some((term) => normalize(term) === q)) return 2.25;
  if (relatedTerms.some((term) => q.includes(normalize(term)) && normalize(term).length >= 8)) {
    return 1.75;
  }

  const tokens = prepareSearchQuery(query).tokens;
  if (tokens.length >= 2) {
    const coversTokens = relatedTerms.some((term) => {
      const t = normalize(term);
      return tokens.every((token) => t.includes(token));
    });
    if (coversTokens) return 2.0;
  }

  return 1;
}

/** Extra multiplier when the full query matches an alias or authored related phrase. */
function phraseMatchMultiplier(
  query: string,
  document: SearchDocument,
  aliasConfig?: SearchAliasConfig,
): number {
  const q = normalize(query);
  if (!q) return 1;

  if (normalize(document.title) === q) return 3;
  if (document.aliases.some((alias) => normalize(alias) === q)) return 2.5;

  if (aliasConfig) {
    const related = relatedTermsByTargetId(aliasConfig).get(document.id) ?? [];
    return relatedPhraseMultiplier(query, related);
  }

  return 1;
}

/** One-shot search over a document list (builds a MiniSearch index each call). */
export function searchDocuments(
  documents: readonly SearchDocument[],
  query: string,
  options: RunSearchOptions = {},
): SearchHit[] {
  const engine = createSearchEngine(documents);
  return searchWithIndex(engine, query, options);
}

/** Search using a prebuilt search engine. */
export function searchWithIndex(
  engine: SearchEngine,
  query: string,
  options: RunSearchOptions = {},
): SearchHit[] {
  const { aliasConfig, ...queryOptions } = options;
  const hits = queryMiniSearch(engine, query, queryOptions).map(({ document, score }) => {
    const adjusted = score * phraseMatchMultiplier(query, document, aliasConfig);
    return {
      document,
      score: adjusted,
      explanations: explainSearchMatch(query, document, { aliasConfig }),
      snippet: buildSearchSnippet(query, document),
    };
  });

  hits.sort((a, b) => b.score - a.score);
  return hits;
}

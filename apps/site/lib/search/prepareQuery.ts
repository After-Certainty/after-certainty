/** Lightweight English stopwords for natural-language queries (not a stemmer). */
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "why",
  "does",
  "do",
  "did",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "as",
  "at",
  "by",
  "from",
  "which",
  "what",
  "how",
  "when",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "into",
  "about",
  "over",
  "under",
  "than",
  "then",
  "so",
  "if",
  "not",
  "no",
  "nor",
]);

export type PreparedSearchQuery = {
  /** Original trimmed query (for explanations / analytics). */
  original: string;
  /** Stopword-filtered token string sent to MiniSearch. */
  searchText: string;
  tokens: string[];
  /** Use AND when multiple significant tokens remain. */
  combineWith: "AND" | "OR";
};

/**
 * Normalize a visitor query for MiniSearch.
 * Multi-token queries use AND so common words (and fuzzy noise) do not flood results.
 */
export function prepareSearchQuery(query: string): PreparedSearchQuery {
  const original = query.trim();
  const tokens = original
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

  // Fall back to raw tokens if stopword filtering removed everything.
  const effective =
    tokens.length > 0
      ? tokens
      : original
          .toLowerCase()
          .split(/[^a-z0-9]+/i)
          .map((t) => t.trim())
          .filter((t) => t.length >= 2);

  return {
    original,
    searchText: effective.join(" "),
    tokens: effective,
    combineWith: effective.length >= 2 ? "AND" : "OR",
  };
}

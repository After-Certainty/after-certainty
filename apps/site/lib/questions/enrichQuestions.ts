import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex, graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import { enrichPathStops, totalEstimatedMinutes } from "@/lib/paths/enrichStop";
import { resolveBookSlugFromEntityId } from "@/lib/paths/validateStop";
import { findCatalogBookForSlug } from "@/lib/search/buildSearchDocuments";
import type { Book as CatalogBook, PodcastEpisode } from "@/types/content";
import type { EnrichedQuestion, QuestionDefinition } from "@/types/questions";
import type { SemanticGraph } from "@/types/semanticGraph";

function titleForGraphNode(index: GraphIndex, canonicalId: string): string {
  const node = index.getNodeByCanonicalId(canonicalId);
  if (!node) return canonicalId;
  return graphNodeTitle(node);
}

function enrichPrimaryBook(
  question: QuestionDefinition,
  index: GraphIndex,
  catalogBooks: readonly CatalogBook[],
): Pick<EnrichedQuestion, "primaryBookTitle" | "primaryBookHref" | "primaryBookCover"> {
  const slug = resolveBookSlugFromEntityId(question.primaryBookId);
  const canonicalSlug = resolveBookCanonicalSlug(slug, [...catalogBooks]) ?? slug;
  const catalogBook = findCatalogBookForSlug(canonicalSlug, catalogBooks);
  const resolvedId =
    index.resolveCanonicalId(canonicalSlug) ??
    index.resolveCanonicalId(question.primaryBookId) ??
    question.primaryBookId;

  return {
    primaryBookTitle: catalogBook?.title ?? titleForGraphNode(index, resolvedId),
    primaryBookHref: `${explorePaths.books}/${canonicalSlug}`,
    primaryBookCover: catalogBook?.coverImage ?? undefined,
  };
}

export function enrichQuestion(
  question: QuestionDefinition,
  graph: SemanticGraph,
  catalogBooks: readonly CatalogBook[],
  podcastEpisodes: readonly PodcastEpisode[],
): EnrichedQuestion {
  const index = buildGraphIndex(graph);
  const pathStopsEnriched = enrichPathStops(
    question.pathStops,
    index,
    catalogBooks,
    podcastEpisodes,
  );

  return {
    ...question,
    pathStopsEnriched,
    totalEstimatedMinutes: totalEstimatedMinutes(pathStopsEnriched),
    ...enrichPrimaryBook(question, index, catalogBooks),
  };
}

export function enrichQuestions(
  questions: QuestionDefinition[],
  graph: SemanticGraph,
  catalogBooks: readonly CatalogBook[],
  podcastEpisodes: readonly PodcastEpisode[],
): EnrichedQuestion[] {
  return questions.map((q) => enrichQuestion(q, graph, catalogBooks, podcastEpisodes));
}

export function buildQuestionSearchHandoffUrl(question: QuestionDefinition): string {
  const hints = question.searchHints?.length ? question.searchHints : question.families.slice(0, 1);
  const q = encodeURIComponent(hints.join(" "));
  return `/search?q=${q}`;
}

/** Match curated questions for a search query using manifest search bridges. */
export function matchQuestionsForSearchQuery(
  query: string,
  manifest: {
    questions: QuestionDefinition[];
    searchBridges?: { terms: string[]; questionIds: string[] }[];
  },
  limit = 2,
): QuestionDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const matchedIds = new Set<string>();
  for (const bridge of manifest.searchBridges ?? []) {
    const hit = bridge.terms.some(
      (term) => normalized.includes(term.toLowerCase()) || term.toLowerCase().includes(normalized),
    );
    if (hit) {
      for (const id of bridge.questionIds) matchedIds.add(id);
    }
  }

  return manifest.questions
    .filter((q) => q.status === "published" && matchedIds.has(q.id))
    .slice(0, limit);
}

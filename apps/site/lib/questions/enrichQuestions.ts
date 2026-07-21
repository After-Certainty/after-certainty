import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import { findBookBySlug } from "@/lib/books/book-metadata";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex, graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import { enrichPathStops, totalEstimatedMinutes } from "@/lib/paths/enrichStop";
import { resolveBookSlugFromEntityId } from "@/lib/paths/validateStop";
import type { PodcastEpisode } from "@/types/content";
import type { EnrichedQuestion, QuestionDefinition } from "@/types/questions";
import type { SemanticGraph } from "@/types/semanticGraph";

function enrichPrimaryBook(
  question: QuestionDefinition,
  index: GraphIndex,
  graph: SemanticGraph,
): Pick<EnrichedQuestion, "primaryBookTitle" | "primaryBookHref" | "primaryBookCover"> {
  const books = graph.books;
  const slug = resolveBookSlugFromEntityId(question.primaryBookId);
  const canonicalSlug = resolveBookCanonicalSlug(slug, books) ?? slug;
  const graphBook = findBookBySlug(canonicalSlug, books);
  const resolvedId =
    index.resolveCanonicalId(canonicalSlug) ??
    index.resolveCanonicalId(question.primaryBookId) ??
    question.primaryBookId;
  const node = index.getNodeByCanonicalId(resolvedId);

  return {
    primaryBookTitle: graphBook?.title ?? (node ? graphNodeTitle(node) : resolvedId),
    primaryBookHref: `${explorePaths.books}/${canonicalSlug}`,
    primaryBookCover: graphBook?.coverImage ?? undefined,
  };
}

export function enrichQuestion(
  question: QuestionDefinition,
  graph: SemanticGraph,
  podcastEpisodes: readonly PodcastEpisode[],
): EnrichedQuestion {
  const index = buildGraphIndex(graph);
  const pathStopsEnriched = enrichPathStops(
    question.pathStops,
    index,
    graph.books,
    podcastEpisodes,
  );

  return {
    ...question,
    pathStopsEnriched,
    totalEstimatedMinutes: totalEstimatedMinutes(pathStopsEnriched),
    ...enrichPrimaryBook(question, index, graph),
  };
}

export function enrichQuestions(
  questions: QuestionDefinition[],
  graph: SemanticGraph,
  podcastEpisodes: readonly PodcastEpisode[],
): EnrichedQuestion[] {
  return questions.map((q) => enrichQuestion(q, graph, podcastEpisodes));
}

export function buildQuestionSearchHandoffUrl(question: QuestionDefinition): string {
  const hints = question.searchHints?.length ? question.searchHints : question.families.slice(0, 1);
  const q = encodeURIComponent(hints.join(" "));
  return `/search?q=${q}`;
}

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

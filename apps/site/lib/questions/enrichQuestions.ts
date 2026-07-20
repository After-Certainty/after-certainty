import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";
import { exploreHrefForCanonicalId, explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex, graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import { sourceDisplayTitle } from "@/lib/graph/sourceDisplay";
import { entityTypeLabel, normalizeBookEntityId } from "@/lib/questions/validate";
import { findCatalogBookForSlug } from "@/lib/search/buildSearchDocuments";
import type { Book as CatalogBook, PodcastEpisode } from "@/types/content";
import type {
  EnrichedPathStop,
  EnrichedQuestion,
  QuestionDefinition,
  PathStopInput,
} from "@/types/questions";
import type { SemanticGraph } from "@/types/semanticGraph";

const DEFAULT_MINUTES: Record<string, number> = {
  book: 25,
  concept: 5,
  pattern: 8,
  situation: 6,
  thinker: 5,
  source: 5,
  podcast_episode: 12,
  external: 10,
};

function defaultMinutesForType(entityType: string): number {
  return DEFAULT_MINUTES[entityType] ?? 8;
}

function resolveBookSlugFromEntityId(entityId: string): string {
  if (entityId.startsWith("book-")) return entityId.slice("book-".length);
  if (entityId.startsWith("catalog:")) return entityId.slice("catalog:".length);
  return entityId;
}

function titleForGraphNode(index: GraphIndex, canonicalId: string): string {
  const node = index.getNodeByCanonicalId(canonicalId);
  if (!node) return canonicalId;
  if (node.kind === "source") return sourceDisplayTitle(node.entity);
  return graphNodeTitle(node);
}

function enrichStop(
  stop: PathStopInput,
  index: GraphIndex,
  catalogBooks: readonly CatalogBook[],
  podcastEpisodes: readonly PodcastEpisode[],
): EnrichedPathStop {
  const minutes = stop.estimatedMinutes ?? defaultMinutesForType(stop.entityType);

  if (stop.entityType === "external") {
    return {
      ...stop,
      resolvedEntityId: stop.entityId ?? "external",
      title: stop.titleOverride ?? "External resource",
      href: stop.externalUrl ?? "#",
      external: true,
      entityTypeLabel: entityTypeLabel(stop.entityType),
      estimatedMinutes: minutes,
    };
  }

  if (stop.entityType === "podcast_episode") {
    const rawId = stop.entityId?.startsWith("podcast:")
      ? stop.entityId.slice("podcast:".length)
      : (stop.entityId ?? "");
    const episode = podcastEpisodes.find((e) => e.id === rawId);
    return {
      ...stop,
      resolvedEntityId: `podcast:${rawId}`,
      title: stop.titleOverride ?? episode?.title ?? rawId,
      href: episode?.episodeUrl ?? "/podcast",
      external: true,
      entityTypeLabel: entityTypeLabel(stop.entityType),
      estimatedMinutes: minutes,
    };
  }

  if (stop.entityType === "book") {
    const entityId = normalizeBookEntityId(stop) ?? stop.entityId ?? "";
    const slug = resolveBookSlugFromEntityId(entityId);
    const canonicalSlug = resolveBookCanonicalSlug(slug, [...catalogBooks]) ?? slug;
    const resolvedId =
      index.resolveCanonicalId(canonicalSlug) ??
      index.resolveCanonicalId(slug) ??
      index.resolveCanonicalId(entityId) ??
      entityId;
    const href = `${explorePaths.books}/${canonicalSlug}`;
    const catalogBook = findCatalogBookForSlug(canonicalSlug, catalogBooks);
    const graphTitle = titleForGraphNode(index, resolvedId);
    return {
      ...stop,
      resolvedEntityId: resolvedId,
      title: stop.titleOverride ?? catalogBook?.title ?? graphTitle,
      href,
      external: false,
      entityTypeLabel: entityTypeLabel(stop.entityType),
      estimatedMinutes: minutes,
    };
  }

  const entityId = stop.entityId ?? "";
  const resolvedId = index.resolveCanonicalId(entityId) ?? entityId;
  const href = exploreHrefForCanonicalId(index, resolvedId) ?? explorePaths.home;

  return {
    ...stop,
    resolvedEntityId: resolvedId,
    title: stop.titleOverride ?? titleForGraphNode(index, resolvedId),
    href,
    external: false,
    entityTypeLabel: entityTypeLabel(stop.entityType),
    estimatedMinutes: minutes,
  };
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
  const pathStopsEnriched = [...question.pathStops]
    .sort((a, b) => a.position - b.position)
    .map((stop) => enrichStop(stop, index, catalogBooks, podcastEpisodes));

  const totalEstimatedMinutes = pathStopsEnriched.reduce(
    (sum, stop) => sum + stop.estimatedMinutes,
    0,
  );

  return {
    ...question,
    pathStopsEnriched,
    totalEstimatedMinutes,
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

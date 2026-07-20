import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";
import { findCatalogBookForSlug } from "@/lib/search/buildSearchDocuments";
import { buildGraphIndex, type GraphIndex } from "@/lib/graph/graph";
import type { Book as CatalogBook, PodcastEpisode } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";
import type { QuestionDefinition, QuestionsManifest } from "@/types/questions";

export type QuestionHealthSeverity = "error" | "warning";

export type QuestionHealthIssue = {
  severity: QuestionHealthSeverity;
  code: string;
  questionId?: string;
  detail: string;
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  book: "Book",
  concept: "Concept",
  pattern: "Pattern",
  situation: "Situation",
  thinker: "Thinker",
  source: "Source",
  podcast_episode: "Podcast episode",
  external: "External",
};

export function entityTypeLabel(entityType: string): string {
  return ENTITY_TYPE_LABELS[entityType] ?? entityType;
}

export function normalizeBookEntityId(input: {
  entityId?: string;
  bookSlug?: string;
}): string | null {
  if (input.bookSlug) {
    return input.bookSlug.startsWith("book-") ? input.bookSlug : `book-${input.bookSlug}`;
  }
  if (!input.entityId) return null;
  if (input.entityId.startsWith("book-")) return input.entityId;
  if (input.entityId.startsWith("catalog:")) return input.entityId;
  return `book-${input.entityId}`;
}

export function resolveStopEntityId(stop: {
  entityType: string;
  entityId?: string;
  bookSlug?: string;
}): string | null {
  if (stop.entityType === "external") return stop.entityId ?? "external";
  if (stop.entityType === "book") return normalizeBookEntityId(stop);
  return stop.entityId ?? null;
}

function isBookInSemanticGraph(
  slug: string,
  graph: SemanticGraph,
  catalogBooks: readonly CatalogBook[],
): boolean {
  const canonical = resolveBookCanonicalSlug(slug, [...catalogBooks]) ?? slug;
  return graph.books.some((b) => b.slug === slug || b.slug === canonical);
}

function isPublishedCatalogBook(
  slug: string,
  catalogBooks: readonly CatalogBook[],
  graph: SemanticGraph,
): boolean {
  if (isBookInSemanticGraph(slug, graph, catalogBooks)) {
    return true;
  }
  const book = findCatalogBookForSlug(slug, catalogBooks);
  if (!book) return false;
  return book.status === "published";
}

function resolveBookSlugFromEntityId(entityId: string): string {
  if (entityId.startsWith("book-")) return entityId.slice("book-".length);
  if (entityId.startsWith("catalog:")) return entityId.slice("catalog:".length);
  return entityId;
}

function warnNonCanonicalEdition(
  slug: string,
  catalogBooks: readonly CatalogBook[],
  issues: QuestionHealthIssue[],
  questionId: string,
): void {
  const canonical = resolveBookCanonicalSlug(slug, [...catalogBooks]);
  if (canonical && canonical !== slug) {
    issues.push({
      severity: "warning",
      code: "non_canonical_edition",
      questionId,
      detail: `Book slug "${slug}" is not canonical; prefer "${canonical}"`,
    });
  }
}

function validateStopReference(
  stop: QuestionDefinition["pathStops"][number],
  index: GraphIndex,
  graph: SemanticGraph,
  catalogBooks: readonly CatalogBook[],
  podcastEpisodes: readonly PodcastEpisode[],
  questionId: string,
  issues: QuestionHealthIssue[],
): string | null {
  if (stop.entityType === "external") {
    if (!stop.externalUrl) {
      issues.push({
        severity: "error",
        code: "missing_external_url",
        questionId,
        detail: `Stop ${stop.position} is external but has no URL`,
      });
    }
    return stop.entityId ?? "external";
  }

  if (stop.entityType === "podcast_episode") {
    const rawId = stop.entityId?.startsWith("podcast:")
      ? stop.entityId.slice("podcast:".length)
      : stop.entityId;
    if (!rawId) {
      issues.push({
        severity: "error",
        code: "missing_podcast_id",
        questionId,
        detail: `Stop ${stop.position} missing podcast entity id`,
      });
      return null;
    }
    const episode = podcastEpisodes.find((e) => e.id === rawId);
    if (!episode) {
      issues.push({
        severity: "error",
        code: "unknown_podcast_episode",
        questionId,
        detail: `Unknown podcast episode "${rawId}" at stop ${stop.position}`,
      });
    }
    return `podcast:${rawId}`;
  }

  if (stop.entityType === "book") {
    const entityId = normalizeBookEntityId(stop);
    if (!entityId) {
      issues.push({
        severity: "error",
        code: "missing_book_ref",
        questionId,
        detail: `Stop ${stop.position} missing book reference`,
      });
      return null;
    }
    const slug = resolveBookSlugFromEntityId(entityId);
    const canonicalSlug = resolveBookCanonicalSlug(slug, [...catalogBooks]) ?? slug;
    const resolvedId =
      index.resolveCanonicalId(canonicalSlug) ??
      index.resolveCanonicalId(slug) ??
      index.resolveCanonicalId(entityId);

    if (!resolvedId) {
      issues.push({
        severity: "error",
        code: "unknown_book",
        questionId,
        detail: `Unknown book "${slug}" at stop ${stop.position}`,
      });
      return null;
    }

    if (!isPublishedCatalogBook(canonicalSlug, catalogBooks, graph)) {
      issues.push({
        severity: "error",
        code: "unpublished_book",
        questionId,
        detail: `Book "${canonicalSlug}" at stop ${stop.position} is not published`,
      });
    }

    warnNonCanonicalEdition(slug, catalogBooks, issues, questionId);
    return resolvedId;
  }

  const entityId = stop.entityId;
  if (!entityId) {
    issues.push({
      severity: "error",
      code: "missing_entity_id",
      questionId,
      detail: `Stop ${stop.position} missing entityId`,
    });
    return null;
  }

  const resolvedId = index.resolveCanonicalId(entityId);
  if (!resolvedId || !index.getNodeByCanonicalId(resolvedId)) {
    issues.push({
      severity: "error",
      code: "unknown_entity",
      questionId,
      detail: `Unknown ${stop.entityType} "${entityId}" at stop ${stop.position}`,
    });
    return null;
  }

  return resolvedId;
}

function stopEntityIds(question: QuestionDefinition): string[] {
  return question.pathStops
    .map((stop) => resolveStopEntityId(stop))
    .filter((id): id is string => Boolean(id));
}

function pathOverlapRatio(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.filter((id) => setB.has(id)).length;
  return shared / Math.max(a.length, b.length);
}

export function collectQuestionHealthIssues(input: {
  manifest: Pick<QuestionsManifest, "questions" | "searchBridges">;
  graph: SemanticGraph;
  catalogBooks: readonly CatalogBook[];
  podcastEpisodes: readonly PodcastEpisode[];
}): QuestionHealthIssue[] {
  const { manifest, graph, catalogBooks, podcastEpisodes } = input;
  const issues: QuestionHealthIssue[] = [];
  const index = buildGraphIndex(graph);

  const ids = new Set<string>();
  const slugs = new Set<string>();
  const questions = new Map<string, QuestionDefinition>();

  for (const question of manifest.questions) {
    if (ids.has(question.id)) {
      issues.push({
        severity: "error",
        code: "duplicate_id",
        questionId: question.id,
        detail: `Duplicate question id "${question.id}"`,
      });
    }
    ids.add(question.id);
    questions.set(question.id, question);

    if (slugs.has(question.slug)) {
      issues.push({
        severity: "error",
        code: "duplicate_slug",
        questionId: question.id,
        detail: `Duplicate slug "${question.slug}"`,
      });
    }
    slugs.add(question.slug);

    if (question.status === "published") {
      if (question.pathStops.length < 3 || question.pathStops.length > 7) {
        issues.push({
          severity: "error",
          code: "invalid_path_length",
          questionId: question.id,
          detail: `Published question must have 3–7 stops (has ${question.pathStops.length})`,
        });
      }
    }

    validateStopReference(
      {
        position: 0,
        entityType: "book",
        entityId: question.primaryBookId,
        description: "Primary book anchor",
      },
      index,
      graph,
      catalogBooks,
      podcastEpisodes,
      question.id,
      issues,
    );
    const primaryResolved = resolveStopEntityId({
      entityType: "book",
      entityId: question.primaryBookId,
    });

    const stopIds = stopEntityIds(question);
    if (primaryResolved && !stopIds.includes(primaryResolved)) {
      issues.push({
        severity: "warning",
        code: "primary_book_not_in_path",
        questionId: question.id,
        detail: "primaryBookId is not referenced in pathStops",
      });
    }

    for (const stop of question.pathStops) {
      validateStopReference(stop, index, graph, catalogBooks, podcastEpisodes, question.id, issues);
    }

    const typeCounts = new Map<string, number>();
    for (const stop of question.pathStops) {
      typeCounts.set(stop.entityType, (typeCounts.get(stop.entityType) ?? 0) + 1);
    }
    const dominant = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (dominant && dominant[1] / question.pathStops.length > 0.8) {
      issues.push({
        severity: "warning",
        code: "path_type_dominance",
        questionId: question.id,
        detail: `Path is dominated by "${dominant[0]}" stops (${dominant[1]}/${question.pathStops.length})`,
      });
    }

    for (const relatedId of question.relatedQuestionIds ?? []) {
      if (!questions.has(relatedId) && !manifest.questions.some((q) => q.id === relatedId)) {
        issues.push({
          severity: "error",
          code: "unknown_related_question",
          questionId: question.id,
          detail: `Related question "${relatedId}" not found in manifest`,
        });
      }
    }
  }

  for (let i = 0; i < manifest.questions.length; i++) {
    for (let j = i + 1; j < manifest.questions.length; j++) {
      const a = manifest.questions[i]!;
      const b = manifest.questions[j]!;
      const overlap = pathOverlapRatio(stopEntityIds(a), stopEntityIds(b));
      if (overlap > 0.6) {
        issues.push({
          severity: "warning",
          code: "path_overlap",
          questionId: a.id,
          detail: `Path overlaps ${Math.round(overlap * 100)}% with "${b.id}"`,
        });
      }
    }
  }

  for (const bridge of manifest.searchBridges ?? []) {
    for (const questionId of bridge.questionIds) {
      if (!manifest.questions.some((q) => q.id === questionId)) {
        issues.push({
          severity: "error",
          code: "unknown_bridge_question",
          questionId,
          detail: `Search bridge references unknown question "${questionId}"`,
        });
      }
    }
  }

  return issues;
}

export function assertQuestionsManifestHealthy(input: {
  manifest: Pick<QuestionsManifest, "questions" | "searchBridges">;
  graph: SemanticGraph;
  catalogBooks: readonly CatalogBook[];
  podcastEpisodes: readonly PodcastEpisode[];
}): void {
  const issues = collectQuestionHealthIssues(input);
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length > 0) {
    const summary = errors.map((e) => `${e.code}: ${e.detail}`).join("\n");
    throw new Error(`Questions manifest health check failed:\n${summary}`);
  }
}

export function collectQuestionHealthReport(input: {
  manifest: Pick<QuestionsManifest, "questions" | "searchBridges">;
  graph: SemanticGraph;
  catalogBooks: readonly CatalogBook[];
  podcastEpisodes: readonly PodcastEpisode[];
}) {
  const issues = collectQuestionHealthIssues(input);
  return {
    errors: issues.filter((i) => i.severity === "error"),
    warnings: issues.filter((i) => i.severity === "warning"),
  };
}

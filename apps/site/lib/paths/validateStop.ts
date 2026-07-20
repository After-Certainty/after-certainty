import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";
import { findCatalogBookForSlug } from "@/lib/search/buildSearchDocuments";
import { buildGraphIndex, type GraphIndex } from "@/lib/graph/graph";
import type { Book as CatalogBook, PodcastEpisode } from "@/types/content";
import type { PathStopInput } from "@/types/paths";
import type { SemanticGraph } from "@/types/semanticGraph";

export type PathHealthSeverity = "error" | "warning";

export type PathHealthIssue = {
  severity: PathHealthSeverity;
  code: string;
  ownerId?: string;
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

export function resolveBookSlugFromEntityId(entityId: string): string {
  if (entityId.startsWith("book-")) return entityId.slice("book-".length);
  if (entityId.startsWith("catalog:")) return entityId.slice("catalog:".length);
  return entityId;
}

export function pathOverlapRatio(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.filter((id) => setB.has(id)).length;
  return shared / Math.max(a.length, b.length);
}

export function stopEntityIdsFromStops(stops: readonly PathStopInput[]): string[] {
  return stops.map((stop) => resolveStopEntityId(stop)).filter((id): id is string => Boolean(id));
}

export type ValidateStopOptions = {
  /** When true, forthcoming/draft catalog books are allowed (upcoming trails). */
  allowUnpublishedBooks?: boolean;
  issueOwnerId?: string;
};

function warnNonCanonicalEdition(
  slug: string,
  catalogBooks: readonly CatalogBook[],
  issues: PathHealthIssue[],
  ownerId: string,
): void {
  const canonical = resolveBookCanonicalSlug(slug, [...catalogBooks]);
  if (canonical && canonical !== slug) {
    issues.push({
      severity: "warning",
      code: "non_canonical_edition",
      ownerId,
      detail: `Book slug "${slug}" is not canonical; prefer "${canonical}"`,
    });
  }
}

export function validateStopReference(
  stop: PathStopInput,
  index: GraphIndex,
  graph: SemanticGraph,
  catalogBooks: readonly CatalogBook[],
  podcastEpisodes: readonly PodcastEpisode[],
  ownerId: string,
  issues: PathHealthIssue[],
  options: ValidateStopOptions = {},
): string | null {
  const { allowUnpublishedBooks = false } = options;

  if (stop.entityType === "external") {
    if (!stop.externalUrl) {
      issues.push({
        severity: "error",
        code: "missing_external_url",
        ownerId,
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
        ownerId,
        detail: `Stop ${stop.position} missing podcast entity id`,
      });
      return null;
    }
    const episode = podcastEpisodes.find((e) => e.id === rawId);
    if (!episode) {
      issues.push({
        severity: "error",
        code: "unknown_podcast_episode",
        ownerId,
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
        ownerId,
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
        ownerId,
        detail: `Unknown book "${slug}" at stop ${stop.position}`,
      });
      return null;
    }

    if (!allowUnpublishedBooks && !isPublishedCatalogBook(canonicalSlug, catalogBooks, graph)) {
      issues.push({
        severity: "error",
        code: "unpublished_book",
        ownerId,
        detail: `Book "${canonicalSlug}" at stop ${stop.position} is not published`,
      });
    }

    warnNonCanonicalEdition(slug, catalogBooks, issues, ownerId);
    return resolvedId;
  }

  const entityId = stop.entityId;
  if (!entityId) {
    issues.push({
      severity: "error",
      code: "missing_entity_id",
      ownerId,
      detail: `Stop ${stop.position} missing entityId`,
    });
    return null;
  }

  const resolvedId = index.resolveCanonicalId(entityId);
  if (!resolvedId || !index.getNodeByCanonicalId(resolvedId)) {
    issues.push({
      severity: "error",
      code: "unknown_entity",
      ownerId,
      detail: `Unknown ${stop.entityType} "${entityId}" at stop ${stop.position}`,
    });
    return null;
  }

  return resolvedId;
}

export { buildGraphIndex };

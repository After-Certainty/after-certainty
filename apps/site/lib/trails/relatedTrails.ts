import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import type { GraphIndex } from "@/lib/graph/graph";
import {
  normalizeBookEntityId,
  pathOverlapRatio,
  resolveBookSlugFromEntityId,
  resolveStopEntityId,
} from "@/lib/paths/validateStop";
import { getPublishedTrails } from "@/lib/trails/loadTrails";
import type { Book } from "@/types/semanticGraph";
import type { PathStopInput } from "@/types/paths";
import type { QuestionDefinition } from "@/types/questions";
import type { TrailDefinition } from "@/types/trails";

/** Maximum path overlap before a trail is treated as too similar to surface on a question page. */
export const QUESTION_TRAIL_OVERLAP_MAX = 0.6;

/** Resolve a path stop to the graph canonical id used for entity matching. */
export function resolveStopCanonicalId(
  stop: PathStopInput,
  index: GraphIndex,
  books: readonly Book[],
): string | null {
  if (stop.entityType === "external") {
    return resolveStopEntityId(stop);
  }

  if (stop.entityType === "podcast_episode") {
    return resolveStopEntityId(stop);
  }

  if (stop.entityType === "book") {
    const entityId = normalizeBookEntityId(stop);
    if (!entityId) return null;
    const slug = resolveBookSlugFromEntityId(entityId);
    const canonicalSlug = resolveBookCanonicalSlug(slug, books) ?? slug;
    return (
      index.resolveCanonicalId(entityId) ??
      index.resolveCanonicalId(canonicalSlug) ??
      index.resolveCanonicalId(slug) ??
      entityId
    );
  }

  const entityId = stop.entityId;
  if (!entityId) return null;
  return index.resolveCanonicalId(entityId) ?? entityId;
}

export function trailReferencesCanonicalId(
  trail: TrailDefinition,
  canonicalId: string,
  index: GraphIndex,
  books: readonly Book[],
): boolean {
  return trail.pathStops.some((stop) => {
    const resolved = resolveStopCanonicalId(stop, index, books);
    return resolved === canonicalId;
  });
}

export function findPublishedTrailsForEntity(input: {
  canonicalId: string;
  index: GraphIndex;
  books: readonly Book[];
  limit?: number;
}): TrailDefinition[] {
  const { canonicalId, index, books, limit = 3 } = input;

  return getPublishedTrails()
    .filter((trail) => trailReferencesCanonicalId(trail, canonicalId, index, books))
    .slice(0, limit);
}

function resolvePathStopCanonicalIds(
  stops: readonly PathStopInput[],
  index: GraphIndex,
  books: readonly Book[],
): string[] {
  return stops
    .map((stop) => resolveStopCanonicalId(stop, index, books))
    .filter((id): id is string => Boolean(id));
}

export function findPublishedTrailsForQuestion(input: {
  question: QuestionDefinition;
  index: GraphIndex;
  books: readonly Book[];
  limit?: number;
  overlapMax?: number;
}): TrailDefinition[] {
  const { question, index, books, limit = 3, overlapMax = QUESTION_TRAIL_OVERLAP_MAX } = input;

  const questionStopIds = resolvePathStopCanonicalIds(question.pathStops, index, books);
  if (questionStopIds.length === 0) return [];

  const ranked = getPublishedTrails()
    .map((trail) => {
      const trailStopIds = resolvePathStopCanonicalIds(trail.pathStops, index, books);
      const overlap = pathOverlapRatio(questionStopIds, trailStopIds);
      return { trail, overlap };
    })
    .filter(({ overlap }) => overlap > 0 && overlap <= overlapMax)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return (a.trail.featuredRank ?? 999) - (b.trail.featuredRank ?? 999);
    })
    .slice(0, limit);

  return ranked.map(({ trail }) => trail);
}

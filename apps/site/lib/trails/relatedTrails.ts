import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";
import type { GraphIndex } from "@/lib/graph/graph";
import {
  normalizeBookEntityId,
  resolveBookSlugFromEntityId,
  resolveStopEntityId,
} from "@/lib/paths/validateStop";
import { getPublishedTrails } from "@/lib/trails/loadTrails";
import type { Book as CatalogBook } from "@/types/content";
import type { PathStopInput } from "@/types/paths";
import type { TrailDefinition } from "@/types/trails";

/** Resolve a path stop to the graph canonical id used for entity matching. */
export function resolveStopCanonicalId(
  stop: PathStopInput,
  index: GraphIndex,
  catalogBooks: readonly CatalogBook[],
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
    const canonicalSlug = resolveBookCanonicalSlug(slug, [...catalogBooks]) ?? slug;
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
  catalogBooks: readonly CatalogBook[],
): boolean {
  return trail.pathStops.some((stop) => {
    const resolved = resolveStopCanonicalId(stop, index, catalogBooks);
    return resolved === canonicalId;
  });
}

export function findPublishedTrailsForEntity(input: {
  canonicalId: string;
  index: GraphIndex;
  catalogBooks: readonly CatalogBook[];
  limit?: number;
}): TrailDefinition[] {
  const { canonicalId, index, catalogBooks, limit = 3 } = input;

  return getPublishedTrails()
    .filter((trail) => trailReferencesCanonicalId(trail, canonicalId, index, catalogBooks))
    .slice(0, limit);
}

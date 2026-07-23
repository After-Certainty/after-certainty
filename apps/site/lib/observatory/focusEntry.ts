import type { RelationshipSelection } from "@/lib/observatory/types";
import type { GraphEntityKind } from "@/types/semanticGraph";

/** Default graph controls for a new observatory / deep-link focus entry. */
export const DEFAULT_OBSERVATORY_MAX_DEPTH = 2;
export const DEFAULT_OBSERVATORY_MAX_NODES = 36;
export const DEFAULT_OBSERVATORY_INCLUDE_RELATED = true;

/** Default progressive cap when tier is not applied (matches historical build default). */
export const DEFAULT_PROGRESSIVE_NEIGHBORS_PER_KIND = 3;

export type FreshFocusEntryCriteria = {
  expandedRootIds: readonly string[];
  focusId: string | null;
  pinnedCount: number;
  pathFromId: string | null;
  pathToId: string | null;
  relationshipSelection: RelationshipSelection;
  kinds: readonly GraphEntityKind[];
  layers: readonly string[];
  predicates: readonly string[];
  maxDepth: number;
  maxNodes: number;
  includeRelated: boolean;
};

/** True when exploration matches a fresh `?focusKind=&focusSlug=` observatory entry. */
export function isAtFreshFocusEntry(
  criteria: FreshFocusEntryCriteria,
  effectiveFocusId: string | null,
): boolean {
  if (effectiveFocusId == null) return false;

  return (
    criteria.expandedRootIds.length === 1 &&
    criteria.expandedRootIds[0] === effectiveFocusId &&
    criteria.focusId === effectiveFocusId &&
    criteria.pinnedCount === 0 &&
    criteria.pathFromId == null &&
    criteria.pathToId == null &&
    criteria.relationshipSelection == null &&
    criteria.kinds.length === 0 &&
    criteria.layers.length === 0 &&
    criteria.predicates.length === 0 &&
    criteria.maxDepth === DEFAULT_OBSERVATORY_MAX_DEPTH &&
    criteria.maxNodes === DEFAULT_OBSERVATORY_MAX_NODES &&
    criteria.includeRelated === DEFAULT_OBSERVATORY_INCLUDE_RELATED
  );
}

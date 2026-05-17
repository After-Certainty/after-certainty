import { useMemo } from "react";

import {
  progressiveNeighborsPerKindForTier,
  type ObservatoryTier,
} from "@/lib/explore/useObservatoryTier";
import type { GraphIndex } from "@/lib/graph/graph";
import {
  buildGraphVizModel,
  buildProgressiveGraphVizModel,
  defaultFocusCanonicalId,
  type GraphVizBuildOptions,
} from "@/lib/graph/graphVizModel";
import type { GraphEntityKind } from "@/types/semanticGraph";

export type ObservatoryVizInput = {
  index: GraphIndex;
  focusId: string | null;
  expandedRootIds: string[];
  kinds: GraphEntityKind[];
  layers: string[];
  predicates: string[];
  maxDepth: number;
  maxNodes: number;
  includeRelated: boolean;
  pinnedIds: Set<string>;
  tier: ObservatoryTier;
};

export function useObservatoryViz(input: ObservatoryVizInput) {
  const {
    index,
    focusId,
    expandedRootIds,
    kinds,
    layers,
    predicates,
    maxDepth,
    maxNodes,
    includeRelated,
    pinnedIds,
    tier,
  } = input;

  const effectiveFocusId = useMemo(() => {
    if (focusId && index.getNodeByCanonicalId(focusId)) return focusId;
    return defaultFocusCanonicalId(index);
  }, [index, focusId]);

  const progressiveSubgraph = expandedRootIds.length > 0;
  const progressiveNeighborsPerKind = progressiveNeighborsPerKindForTier(tier);

  const viz = useMemo(() => {
    const shelfPaddingBooks =
      progressiveSubgraph
        ? 0
        : kinds.length === 0 || kinds.includes("book")
          ? Math.min(16, Math.max(0, Math.floor(maxNodes * 0.4)))
          : 0;
    const opt: GraphVizBuildOptions = {
      focusCanonicalId: effectiveFocusId,
      maxDepth,
      maxNodes,
      kinds,
      layers,
      predicates,
      includeRelatedEntityLinks: includeRelated,
      pinnedCanonicalIds: [...pinnedIds],
      shelfPaddingBooks,
      progressiveNeighborsPerKind: progressiveSubgraph ? progressiveNeighborsPerKind : undefined,
    };
    if (progressiveSubgraph) {
      return buildProgressiveGraphVizModel(index, opt, expandedRootIds);
    }
    return buildGraphVizModel(index, opt);
  }, [
    index,
    effectiveFocusId,
    maxDepth,
    maxNodes,
    kinds,
    layers,
    predicates,
    includeRelated,
    pinnedIds,
    progressiveSubgraph,
    expandedRootIds,
    progressiveNeighborsPerKind,
  ]);

  return { viz, effectiveFocusId, progressiveSubgraph };
}

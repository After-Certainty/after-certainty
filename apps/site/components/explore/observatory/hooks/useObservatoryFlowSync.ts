"use client";

import { useEffect, useRef } from "react";
import type { Edge, Node } from "@xyflow/react";

import type { GraphIndex } from "@/lib/graph/graph";
import { exploreHrefForCanonicalId } from "@/lib/graph/explorePaths";
import { vizEdgeDedupKey } from "@/lib/graph/graphVizModel";
import type { VizEdge } from "@/lib/graph/graphVizModel";
import { computeSemanticWeights, shouldShowEdgeLabel } from "@/lib/observatory/focusEngine";
import type { RelationshipSelection } from "@/lib/observatory/types";
import { mergeNodePositions, spreadNodePositions, type XY } from "@/lib/explore/observatoryLayout";
import type { SemanticFlowEdgeData } from "@/components/explore/observatory/SemanticFlowEdge";
import type { SemanticFlowNodeData } from "@/components/explore/observatory/SemanticFlowNode";

export type LayoutTidySnapshot = {
  type: "preserve-pins";
  atRevision: number;
  pins: Map<string, XY>;
};

export type UseObservatoryFlowSyncArgs = {
  index: GraphIndex;
  viz: { nodeIds: string[]; edges: VizEdge[] };
  effectiveFocusId: string | null;
  selectedId: string | null;
  pinnedIds: Set<string>;
  pathNodeIds: Set<string>;
  pathPairKeys: Set<string>;
  relationshipSelection: RelationshipSelection;
  hoveredEdgeKey: string | null;
  showRelationshipLabels: boolean;
  layoutRevision: number;
  layoutTidyRef: React.MutableRefObject<LayoutTidySnapshot | null>;
  setNodes: React.Dispatch<React.SetStateAction<Node<SemanticFlowNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge<SemanticFlowEdgeData>[]>>;
};

function undirectedPairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function useObservatoryFlowSync({
  index,
  viz,
  effectiveFocusId,
  selectedId,
  pinnedIds,
  pathNodeIds,
  pathPairKeys,
  relationshipSelection,
  hoveredEdgeKey,
  showRelationshipLabels,
  layoutRevision,
  layoutTidyRef,
  setNodes,
  setEdges,
}: UseObservatoryFlowSyncArgs) {
  /** One replay after spread (React Strict Mode double-invoke); must not persist across later syncs. */
  const spreadReplayRef = useRef<{ revision: number; positions: Map<string, XY> } | null>(null);

  useEffect(() => {
    const fid = effectiveFocusId ?? viz.nodeIds[0] ?? "";
    if (!fid) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const visibleNodeIds = new Set(viz.nodeIds);
    const visibleEdges = viz.edges.map((e) => ({
      edgeKey: vizEdgeDedupKey(e.sourceId, e.targetId, e.relationship),
      sourceId: e.sourceId,
      targetId: e.targetId,
    }));

    const weights = computeSemanticWeights({
      index,
      visibleNodeIds,
      visibleEdges,
      focusCanonicalId: effectiveFocusId,
      relationshipSelection: relationshipSelection
        ? {
            edgeKey: relationshipSelection.edgeKey,
            sourceId: relationshipSelection.sourceId,
            targetId: relationshipSelection.targetId,
            predicate: relationshipSelection.predicate,
          }
        : null,
      pathNodeIds,
      pathPairKeys,
    });

    setNodes((prev) => {
      const snapshot = layoutTidyRef.current;
      const shouldSpread =
        snapshot?.type === "preserve-pins" && snapshot.atRevision === layoutRevision;

      let posMap: Map<string, XY>;
      const replay = spreadReplayRef.current;
      if (shouldSpread) {
        layoutTidyRef.current = null;
        posMap = spreadNodePositions(fid, viz.nodeIds, snapshot.pins);
        spreadReplayRef.current = { revision: layoutRevision, positions: posMap };
        queueMicrotask(() => {
          if (spreadReplayRef.current?.revision === layoutRevision) {
            spreadReplayRef.current = null;
          }
        });
      } else if (replay?.revision === layoutRevision) {
        posMap = replay.positions;
        spreadReplayRef.current = null;
      } else {
        const prevPos = new Map(prev.map((p) => [p.id, p.position]));
        posMap = mergeNodePositions(fid, viz.nodeIds, prevPos);
      }
      const next: Node<SemanticFlowNodeData>[] = [];
      for (const id of viz.nodeIds) {
        const gn = index.getNodeByCanonicalId(id);
        if (!gn) continue;
        const tier = weights.nodes.get(id) ?? "dim";
        next.push({
          id,
          type: "semantic",
          position: posMap.get(id) ?? { x: 0, y: 0 },
          draggable: !pinnedIds.has(id),
          data: {
            graphNode: gn,
            semanticTier: tier,
            isFocus: tier === "focus",
            isSelected: id === selectedId,
            isPinned: pinnedIds.has(id),
            onPath: pathNodeIds.has(id),
            detailHref: exploreHrefForCanonicalId(index, id) ?? undefined,
          },
        });
      }
      return next;
    });

    setEdges(
      viz.edges.map((e) => {
        const edgeKey = vizEdgeDedupKey(e.sourceId, e.targetId, e.relationship);
        const tier = weights.edges.get(edgeKey) ?? "dim";
        return {
          id: e.id,
          source: e.sourceId,
          target: e.targetId,
          type: "semantic",
          data: {
            edgeKey,
            relationship: e.relationship,
            semanticTier: tier,
            pathTraced: pathPairKeys.has(undirectedPairKey(e.sourceId, e.targetId)),
            showLabel: shouldShowEdgeLabel(tier, edgeKey, hoveredEdgeKey, showRelationshipLabels),
            isSyntheticRelated: e.isSyntheticRelated,
            description: e.description,
          },
        };
      }),
    );
  }, [
    index,
    viz,
    effectiveFocusId,
    selectedId,
    pinnedIds,
    pathNodeIds,
    pathPairKeys,
    relationshipSelection,
    hoveredEdgeKey,
    showRelationshipLabels,
    layoutRevision,
    layoutTidyRef,
    setNodes,
    setEdges,
  ]);
}

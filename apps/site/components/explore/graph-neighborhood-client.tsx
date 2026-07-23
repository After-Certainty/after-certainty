"use client";

import { useMemo } from "react";

import { GraphNeighborhoodCards } from "@/components/explore/graph-neighborhood-cards";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getConnectedGraphNeighborhood } from "@/lib/graph/graphTraversal";
import type { GraphFocalNode, SemanticGraph } from "@/types/semanticGraph";

type GraphNeighborhoodClientProps = {
  graph: SemanticGraph;
  focal: GraphFocalNode;
  title?: string;
  maxDepth?: number;
  maxNodes?: number;
};

/**
 * Client-only neighborhood for `/explore` observatory — builds `GraphIndex` from JSON
 * so we never pass function-bearing `GraphIndex` across the Server/Client boundary.
 */
export function GraphNeighborhoodClient({
  graph,
  focal,
  title,
  maxDepth = 1,
  maxNodes = 20,
}: GraphNeighborhoodClientProps) {
  const index = useMemo(() => buildGraphIndex(graph), [graph]);
  const nodes = useMemo(
    () => getConnectedGraphNeighborhood(index, focal, { maxDepth, maxNodes }),
    [index, focal, maxDepth, maxNodes],
  );
  return <GraphNeighborhoodCards nodes={nodes} title={title} />;
}

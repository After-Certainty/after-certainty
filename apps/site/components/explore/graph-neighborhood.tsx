import type { GraphIndex } from "@/lib/graph/graph";
import { GraphNeighborhoodCards } from "@/components/explore/graph-neighborhood-cards";
import type { GraphFocalNode } from "@/types/semanticGraph";
import { getConnectedGraphNeighborhood } from "@/lib/graph/graphTraversal";

type GraphNeighborhoodProps = {
  index: GraphIndex;
  /** Focal node — stable for future force-directed / canvas adapters. */
  focal: GraphFocalNode;
  title?: string;
  maxDepth?: number;
  maxNodes?: number;
};

/**
 * Card-first neighborhood around a focal node.
 *
 * Future graph visualization (D3, Cytoscape, WebGL):
 * - Keep `focal` + `index` as the stable contract; swap this layout for a `<canvas>` or
 *   client component that reads the same `getConnectedGraphNeighborhood` output or full `graph`.
 * - Extension hooks: edge weighting, "preserves / threatens" semantics, concept pairings,
 *   semantic overlays (podcast / essay subgraphs), reading paths as highlighted trails.
 * - Consider a `renderMode: "cards" | "graph"` prop once a viz layer ships.
 */
export function GraphNeighborhood({
  index,
  focal,
  title = "Connected terrain",
  maxDepth = 1,
  maxNodes = 20,
}: GraphNeighborhoodProps) {
  const nodes = getConnectedGraphNeighborhood(index, focal, { maxDepth, maxNodes });
  return <GraphNeighborhoodCards nodes={nodes} title={title} />;
}

import type { GraphIndex } from "@/lib/graph/graph";
import type { GraphFocalNode } from "@/types/semanticGraph";
import { getConnectedGraphNeighborhood } from "@/lib/graph/graphTraversal";
import { exploreHrefForNode } from "@/lib/graph/explorePaths";
import Link from "next/link";

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
  if (nodes.length === 0) return null;

  return (
    <section className="space-y-5 border-t border-border/30 pt-8 md:pt-10">
      <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">{title}</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((n) => (
          <li key={n.id}>
            <Link
              href={exploreHrefForNode(n)}
              className="block rounded-md border border-border/35 bg-bg-elevated/20 p-4 transition-colors hover:border-accent/40"
            >
              <p className="text-[10px] uppercase tracking-[0.26em] text-accent">{n.kind}</p>
              <p className="mt-2 font-display text-lg text-fg">
                {n.kind === "source" ? n.entity.name : n.entity.title}
              </p>
              {n.kind === "concept" ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted">{n.entity.shortDefinition}</p>
              ) : null}
              {n.kind === "pattern" ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted">{n.entity.summary}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

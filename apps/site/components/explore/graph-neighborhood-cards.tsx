import Link from "next/link";

import type { GraphNode } from "@/lib/graph/graph";
import { exploreHrefForNode } from "@/lib/graph/explorePaths";

export type GraphNeighborhoodCardsProps = {
  nodes: GraphNode[];
  title?: string;
};

/** Presentational card grid — safe from both Server and Client parents (no GraphIndex). */
export function GraphNeighborhoodCards({ nodes, title = "Connected terrain" }: GraphNeighborhoodCardsProps) {
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
              <p className="mt-2 font-display text-lg text-fg">{n.kind === "source" ? n.entity.name : n.entity.title}</p>
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

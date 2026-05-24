import type { GraphIndex } from "@/lib/graph/graph";
import { exploreObservatoryRelationshipHref } from "@/lib/graph/explorePaths";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import { vizEdgeDedupKey } from "@/lib/graph/graphVizModel";
import type { Relationship } from "@/types/semanticGraph";
import Link from "next/link";

type TensionRelationshipListProps = {
  index: GraphIndex;
  relationships: Relationship[];
  focalCanonicalId: string;
  focalKind: "concept" | "pattern" | "book" | "source";
  focalSlug: string;
};

function labelForCanonicalId(index: GraphIndex, id: string): string {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return "Unknown reference";
  return n.kind === "source" ? n.entity.name : n.entity.title;
}

export function TensionRelationshipList({
  index,
  relationships,
  focalCanonicalId,
  focalKind,
  focalSlug,
}: TensionRelationshipListProps) {
  if (relationships.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">Structural tensions</h2>
      <ul className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
        {relationships.flatMap((r, i) => {
          const ends = relationshipEndpointsResolved(index, r);
          if (!ends) return [];
          const otherId = ends.sourceId === focalCanonicalId ? ends.targetId : ends.sourceId;
          const edgeKey = vizEdgeDedupKey(ends.sourceId, ends.targetId, r.relationship);
          const observatoryHref = exploreObservatoryRelationshipHref(focalKind, focalSlug, edgeKey);
          return [
            <li key={`tension-${r.source}-${r.target}-${i}`}>
              <Link
                href={observatoryHref}
                className="block rounded-md border border-border/35 bg-bg-elevated/15 p-4 transition-colors hover:border-accent/40"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-accent">Structural tension</p>
                <p className="mt-2 font-display text-lg text-fg">
                  {labelForCanonicalId(index, focalCanonicalId)}
                  <span className="mx-2 text-muted">↔</span>
                  {labelForCanonicalId(index, otherId)}
                </p>
                {r.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{r.description}</p>
                ) : null}
                <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted">Open in observatory</p>
              </Link>
            </li>,
          ];
        })}
      </ul>
    </section>
  );
}

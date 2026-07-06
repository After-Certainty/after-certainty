import type { GraphIndex } from "@/lib/graph/graph";
import {
  exploreHrefForCanonicalId,
  exploreObservatoryRelationshipHref,
} from "@/lib/graph/explorePaths";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import { vizEdgeDedupKey } from "@/lib/graph/graphVizModel";
import type { GraphEntityKind, Relationship } from "@/types/semanticGraph";
import { RelationshipCard } from "@/components/explore/relationship-card";

type RelationshipListProps = {
  index: GraphIndex;
  relationships: Relationship[];
  mode: "incoming" | "outgoing";
  /** Section heading */
  title: string;
  /** When set, cards link into the observatory with the edge selected. */
  observatoryFocus?: { kind: GraphEntityKind; slug: string };
};

function labelForCanonicalId(index: GraphIndex, id: string): string {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return "Unknown reference";
  switch (n.kind) {
    case "book":
      return n.entity.title;
    case "concept":
      return n.entity.title;
    case "pattern":
      return n.entity.title;
    case "source":
      return n.entity.name;
  }
}

export function RelationshipList({
  index,
  relationships,
  mode,
  title,
  observatoryFocus,
}: RelationshipListProps) {
  if (relationships.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
        {relationships.flatMap((r, i) => {
          const ends = relationshipEndpointsResolved(index, r);
          if (!ends) return [];
          const otherId = mode === "incoming" ? ends.sourceId : ends.targetId;
          const href = exploreHrefForCanonicalId(index, otherId);
          const edgeKey = vizEdgeDedupKey(ends.sourceId, ends.targetId, r.relationship);
          const observatoryHref = observatoryFocus
            ? exploreObservatoryRelationshipHref(
                observatoryFocus.kind,
                observatoryFocus.slug,
                edgeKey,
              )
            : undefined;
          return [
            <li key={`${r.source}-${r.target}-${r.relationship}-${i}`}>
              <RelationshipCard
                relationship={r}
                counterpartyLabel={labelForCanonicalId(index, otherId)}
                counterpartyHref={href}
                observatoryHref={observatoryHref}
                direction={mode}
              />
            </li>,
          ];
        })}
      </ul>
    </section>
  );
}

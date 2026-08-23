import { graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import {
  exploreHrefForCanonicalId,
  exploreObservatoryRelationshipHref,
} from "@/lib/graph/explorePaths";
import { relationshipEndpointsResolved } from "@/lib/graph/query/graphTraversal";
import { vizEdgeDedupKey } from "@/lib/graph/presentation/graphVizModel";
import type { GraphEntityKind, Relationship } from "@/types/semanticGraph";
import { RelationshipCard } from "@/components/explore/relationship-card";
import { RelatedSectionDisclosure } from "@/components/explore/related-section-disclosure";

type RelationshipListProps = {
  index: GraphIndex;
  relationships: Relationship[];
  mode: "incoming" | "outgoing";
  /** Section heading */
  title: string;
  /** When set, cards link into the observatory with the edge selected. */
  observatoryFocus?: { kind: GraphEntityKind; slug: string };
  /**
   * When true, wrap in mobile-collapsed disclosure (Patterns detail Phase 4).
   * Other callers keep the always-visible heading + grid.
   */
  collapsible?: boolean;
};

function labelForCanonicalId(index: GraphIndex, id: string): string {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return "Unknown reference";
  return graphNodeTitle(n);
}

function dynamicsCountLabel(count: number): string {
  return `${count} ${count === 1 ? "relationship" : "relationships"}`;
}

export function RelationshipList({
  index,
  relationships,
  mode,
  title,
  observatoryFocus,
  collapsible = false,
}: RelationshipListProps) {
  if (relationships.length === 0) return null;

  const cards = (
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
  );

  if (!collapsible) {
    return (
      <section className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">{title}</h2>
        {cards}
      </section>
    );
  }

  return (
    <RelatedSectionDisclosure
      id={`dynamics-${mode}`}
      title={title}
      countLabel={dynamicsCountLabel(relationships.length)}
    >
      {cards}
    </RelatedSectionDisclosure>
  );
}

import type { GraphIndex } from "@/lib/graph/graph";
import { relationshipsForConcept } from "@/lib/graph/relationshipTaxonomy";
import type { GraphEntityKind } from "@/types/semanticGraph";
import { RelationshipList } from "@/components/explore/relationship-list";
import { TensionRelationshipList } from "@/components/explore/tension-relationship-list";

type SemanticRelationshipsSectionProps = {
  index: GraphIndex;
  focalCanonicalId: string;
  focalKind: GraphEntityKind;
  focalSlug: string;
};

export function SemanticRelationshipsSection({
  index,
  focalCanonicalId,
  focalKind,
  focalSlug,
}: SemanticRelationshipsSectionProps) {
  const { tensions, outgoingDynamics, incomingDynamics } = relationshipsForConcept(index, focalCanonicalId);
  const hasAny = tensions.length + outgoingDynamics.length + incomingDynamics.length > 0;
  if (!hasAny) return null;

  return (
    <div className="flex flex-col gap-12">
      <TensionRelationshipList
        index={index}
        relationships={tensions}
        focalCanonicalId={focalCanonicalId}
        focalKind={focalKind}
        focalSlug={focalSlug}
      />
      {outgoingDynamics.length > 0 ? (
        <RelationshipList
          index={index}
          relationships={outgoingDynamics}
          mode="outgoing"
          title="Outgoing dynamics"
          observatoryFocus={{ kind: focalKind, slug: focalSlug }}
        />
      ) : null}
      {incomingDynamics.length > 0 ? (
        <RelationshipList
          index={index}
          relationships={incomingDynamics}
          mode="incoming"
          title="Incoming dynamics"
          observatoryFocus={{ kind: focalKind, slug: focalSlug }}
        />
      ) : null}
    </div>
  );
}

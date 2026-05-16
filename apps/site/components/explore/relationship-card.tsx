import Link from "next/link";
import { formatRelationshipLabelForDisplay } from "@/lib/graph/relationshipVisuals";
import type { Relationship } from "@/types/semanticGraph";

type RelationshipCardProps = {
  relationship: Relationship;
  /** Human label for the counterparty (e.g. another concept title). */
  counterpartyLabel: string;
  /** When unknown entity, omit link. */
  counterpartyHref?: string | null;
  /** Primary action (e.g. focus an edge on the map). Ignored when `counterpartyHref` is set. */
  onPress?: () => void;
  /** Visual match for {@link onPress} selection state. */
  isActive?: boolean;
};

const shellClass = (active: boolean, linked: boolean, interactive: boolean) =>
  [
    "block w-full rounded-md border p-4 text-left transition-colors",
    interactive ? "hover:border-accent/40" : "",
    linked ? "bg-bg-elevated/20" : "bg-bg-elevated/15",
    active ? "border-accent/55 ring-1 ring-accent/35" : "border-border/35",
  ]
    .filter(Boolean)
    .join(" ");

export function RelationshipCard({
  relationship,
  counterpartyLabel,
  counterpartyHref,
  onPress,
  isActive = false,
}: RelationshipCardProps) {
  const body = (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-accent">
        {formatRelationshipLabelForDisplay(relationship.relationship)}
      </p>
      <p className="font-display text-lg text-fg">{counterpartyLabel}</p>
      {relationship.description ? (
        <p className="text-sm leading-relaxed text-muted">{relationship.description}</p>
      ) : null}
    </div>
  );

  if (counterpartyHref) {
    return (
      <Link href={counterpartyHref} className={shellClass(isActive, true, true)}>
        {body}
      </Link>
    );
  }

  if (onPress) {
    return (
      <button type="button" onClick={onPress} className={shellClass(isActive, false, true)}>
        {body}
      </button>
    );
  }

  return <div className={shellClass(isActive, false, false)}>{body}</div>;
}

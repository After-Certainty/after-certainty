import Link from "next/link";
import type { Relationship } from "@/types/semanticGraph";

type RelationshipCardProps = {
  relationship: Relationship;
  /** Human label for the counterparty (e.g. another concept title). */
  counterpartyLabel: string;
  /** When unknown entity, omit link. */
  counterpartyHref?: string | null;
};

export function RelationshipCard({ relationship, counterpartyLabel, counterpartyHref }: RelationshipCardProps) {
  const body = (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-accent">{relationship.relationship}</p>
      <p className="font-display text-lg text-fg">{counterpartyLabel}</p>
      {relationship.description ? (
        <p className="text-sm leading-relaxed text-muted">{relationship.description}</p>
      ) : null}
    </div>
  );

  if (counterpartyHref) {
    return (
      <Link href={counterpartyHref} className="block rounded-md border border-border/35 bg-bg-elevated/20 p-4 transition-colors hover:border-accent/40">
        {body}
      </Link>
    );
  }

  return <div className="rounded-md border border-border/35 bg-bg-elevated/15 p-4">{body}</div>;
}

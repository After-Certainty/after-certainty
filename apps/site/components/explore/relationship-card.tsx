"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import { formatRelationshipLabelForDisplay } from "@/lib/graph/relationshipVisuals";
import type { Relationship } from "@/types/semanticGraph";

type RelationshipCardProps = {
  relationship: Relationship;
  counterpartyLabel: string;
  counterpartyHref?: string | null;
  observatoryHref?: string | null;
  onPress?: () => void;
  isActive?: boolean;
};

const shellClass = (active: boolean, interactive: boolean) =>
  [
    "block w-full rounded-md border p-4 text-left transition-colors",
    interactive ? "hover:border-accent/40" : "",
    "bg-bg-elevated/15",
    active ? "border-accent/55 ring-1 ring-accent/35" : "border-border/35",
  ]
    .filter(Boolean)
    .join(" ");

function stopNav(e: MouseEvent) {
  e.stopPropagation();
}

export function RelationshipCard({
  relationship,
  counterpartyLabel,
  counterpartyHref,
  observatoryHref,
  onPress,
  isActive = false,
}: RelationshipCardProps) {
  const inner = (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-accent">
        {formatRelationshipLabelForDisplay(relationship.relationship)}
      </p>
      {counterpartyHref ? (
        <Link
          href={counterpartyHref}
          className="font-display text-lg text-fg hover:text-accent hover:underline"
          onClick={stopNav}
          onPointerDown={stopNav}
        >
          {counterpartyLabel}
        </Link>
      ) : (
        <p className="font-display text-lg text-fg">{counterpartyLabel}</p>
      )}
      {relationship.description ? (
        <p className="text-sm leading-relaxed text-muted">{relationship.description}</p>
      ) : null}
      {observatoryHref && !onPress ? (
        <p className="pt-1">
          <Link
            href={observatoryHref}
            className="text-[10px] uppercase tracking-[0.18em] text-accent hover:underline"
            onClick={stopNav}
            onPointerDown={stopNav}
          >
            Open in observatory
          </Link>
        </p>
      ) : null}
    </div>
  );

  if (onPress) {
    return (
      <button type="button" onClick={onPress} className={shellClass(isActive, true)}>
        {inner}
      </button>
    );
  }

  return <div className={shellClass(isActive, Boolean(counterpartyHref))}>{inner}</div>;
}

"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import { SiteIcon } from "@/components/icons/site-icon";
import {
  dynamicsDirectionIcons,
  observatoryIcon,
} from "@/components/icons/semantic";
import { formatRelationshipLabelForDisplay } from "@/lib/graph/presentation/relationshipVisuals";
import type { Relationship } from "@/types/semanticGraph";

type RelationshipCardProps = {
  relationship: Relationship;
  counterpartyLabel: string;
  counterpartyHref?: string | null;
  observatoryHref?: string | null;
  onPress?: () => void;
  isActive?: boolean;
  /** Direction of the relationship from the focal entity's perspective */
  direction?: "outgoing" | "incoming";
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
  direction,
}: RelationshipCardProps) {
  const DirectionIcon =
    direction === "incoming"
      ? dynamicsDirectionIcons.incoming
      : direction === "outgoing"
        ? dynamicsDirectionIcons.outgoing
        : null;

  const inner = (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-accent">
        {formatRelationshipLabelForDisplay(relationship.relationship)}
      </p>
      {direction ? (
        <p className="flex items-center gap-2 font-display text-lg text-fg">
          {direction === "incoming" && DirectionIcon ? (
            <SiteIcon
              icon={DirectionIcon}
              size="sm"
              className="text-accent"
              decorative={false}
              aria-label="incoming"
            />
          ) : null}
          {counterpartyHref ? (
            <Link
              href={counterpartyHref}
              className="hover:text-accent hover:underline"
              onClick={stopNav}
              onPointerDown={stopNav}
            >
              {counterpartyLabel}
            </Link>
          ) : (
            <span>{counterpartyLabel}</span>
          )}
          {direction === "outgoing" && DirectionIcon ? (
            <SiteIcon
              icon={DirectionIcon}
              size="sm"
              className="text-accent"
              decorative={false}
              aria-label="outgoing"
            />
          ) : null}
        </p>
      ) : counterpartyHref ? (
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
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-accent hover:underline"
            onClick={stopNav}
            onPointerDown={stopNav}
          >
            <SiteIcon icon={observatoryIcon} size="sm" className="text-accent" />
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

"use client";

import {
  explorePrimaryButtonClass,
  exploreSecondaryButtonClass,
} from "@/components/explore/explore-action-buttons";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { exploreObservatoryFocusHref } from "@/lib/graph/explorePaths";
import type { GraphEntityKind } from "@/types/semanticGraph";

type ExploreObservatoryFocusLinkProps = {
  kind: GraphEntityKind;
  slug: string;
  className?: string;
  variant?: "primary" | "secondary";
};

/** Link to `/explore` with query params that focus the observatory on this entity. */
export function ExploreObservatoryFocusLink({
  kind,
  slug,
  className,
  variant = "primary",
}: ExploreObservatoryFocusLinkProps) {
  const buttonClass = variant === "primary" ? explorePrimaryButtonClass : exploreSecondaryButtonClass;

  return (
    <TrackedLink
      href={exploreObservatoryFocusHref(kind, slug)}
      className={className ?? buttonClass}
      analytics={{
        event: "select_content",
        params: { content_type: kind, item_id: slug, method: "link" },
      }}
    >
      Focus in observatory
    </TrackedLink>
  );
}

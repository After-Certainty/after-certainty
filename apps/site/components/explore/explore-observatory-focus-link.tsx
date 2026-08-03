"use client";

import {
  explorePrimaryButtonClass,
  exploreSecondaryButtonClass,
} from "@/components/explore/explore-action-buttons";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { SiteIcon } from "@/components/icons/site-icon";
import { observatoryIcon } from "@/components/icons/semantic";
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
      className={className ?? `${buttonClass} inline-flex items-center gap-2`}
      analytics={{
        event: "select_content",
        params: { content_type: kind, item_id: slug, method: "link" },
      }}
    >
      <SiteIcon icon={observatoryIcon} size="sm" className="opacity-90" />
      Open in graph
    </TrackedLink>
  );
}

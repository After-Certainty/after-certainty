import Link from "next/link";

import {
  explorePrimaryButtonClass,
  exploreSecondaryButtonClass,
} from "@/components/explore/explore-action-buttons";
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
    <Link href={exploreObservatoryFocusHref(kind, slug)} className={className ?? buttonClass}>
      Focus in observatory
    </Link>
  );
}

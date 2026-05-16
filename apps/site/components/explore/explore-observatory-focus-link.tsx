import Link from "next/link";

import { exploreObservatoryFocusHref } from "@/lib/graph/explorePaths";
import type { GraphEntityKind } from "@/types/semanticGraph";

type ExploreObservatoryFocusLinkProps = {
  kind: GraphEntityKind;
  slug: string;
  className?: string;
};

/** Link to `/explore` with query params that focus the observatory on this entity. */
export function ExploreObservatoryFocusLink({ kind, slug, className }: ExploreObservatoryFocusLinkProps) {
  return (
    <Link
      href={exploreObservatoryFocusHref(kind, slug)}
      className={
        className ??
        "text-[11px] uppercase tracking-[0.2em] text-accent underline-offset-4 transition-colors hover:underline"
      }
    >
      Focus in observatory
    </Link>
  );
}

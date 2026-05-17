import Link from "next/link";

import { exploreSecondaryButtonClass } from "@/components/explore/explore-action-buttons";
import { ExploreObservatoryFocusLink } from "@/components/explore/explore-observatory-focus-link";
import type { SemanticBookActionLinkItem } from "@/lib/books/semantic-book-action-links";
import type { GraphEntityKind } from "@/types/semanticGraph";

type ExploreEntityDetailActionsProps = {
  observatory: { kind: GraphEntityKind; slug: string };
  publicationLinks?: SemanticBookActionLinkItem[];
  ariaLabel?: string;
};

/** Observatory focus (primary) and optional purchase/download actions on explore entity detail pages. */
export function ExploreEntityDetailActions({
  observatory,
  publicationLinks = [],
  ariaLabel,
}: ExploreEntityDetailActionsProps) {
  const label = ariaLabel ?? (publicationLinks.length > 0 ? "Get the book" : "Actions");

  return (
    <section className="mt-10" aria-label={label}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <ExploreObservatoryFocusLink kind={observatory.kind} slug={observatory.slug} variant="primary" />
        {publicationLinks.map((item) => (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={exploreSecondaryButtonClass}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

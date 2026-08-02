"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  explorePrimaryButtonClass,
  exploreSecondaryButtonClass,
} from "@/components/explore/explore-action-buttons";
import { ExploreObservatoryFocusLink } from "@/components/explore/explore-observatory-focus-link";
import {
  isInternalBookAction,
  type SemanticBookActionLinkItem,
} from "@/lib/books/semantic-book-action-links";
import type { GraphEntityKind } from "@/types/semanticGraph";

type ExploreEntityDetailActionsProps = {
  observatory: { kind: GraphEntityKind; slug: string };
  publicationLinks?: SemanticBookActionLinkItem[];
  ariaLabel?: string;
};

function fileExtensionFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const ext = path.split(".").pop();
    return ext && ext.length <= 5 ? ext.toLowerCase() : "file";
  } catch {
    return "file";
  }
}

function analyticsForLink(
  observatory: { kind: GraphEntityKind; slug: string },
  item: SemanticBookActionLinkItem,
) {
  if (item.kind === "download") {
    return {
      event: "file_download" as const,
      params: {
        file_extension: fileExtensionFromUrl(item.href),
        file_name: item.label,
        link_url: item.href,
        content_type: "book" as const,
        item_id: observatory.slug,
      },
    };
  }
  if (isInternalBookAction(item.kind)) {
    return {
      event: "select_content" as const,
      params: {
        content_type: "book" as const,
        item_id: observatory.slug,
        method: "link" as const,
      },
    };
  }
  return {
    event: "click" as const,
    params: {
      link_url: item.href,
      link_text: item.label,
      outbound: true as const,
      location: "explore_entity_detail",
      platform: "book_retailer",
    },
  };
}

/**
 * Observatory focus plus purchase/download/read actions on explore entity detail pages.
 * Read links render as primary CTAs; related grids remain the primary crawl path for entities.
 */
export function ExploreEntityDetailActions({
  observatory,
  publicationLinks = [],
  ariaLabel,
}: ExploreEntityDetailActionsProps) {
  const label = ariaLabel ?? (publicationLinks.length > 0 ? "Get the book" : "Actions");
  const readLinks = publicationLinks.filter((item) => item.kind === "read");
  const otherLinks = publicationLinks.filter((item) => item.kind !== "read");

  return (
    <section className="mt-6 md:mt-10" aria-label={label}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {readLinks.map((item) => (
          <TrackedLink
            key={`${item.href}-${item.label}`}
            href={item.href}
            className={explorePrimaryButtonClass}
            analytics={analyticsForLink(observatory, item)}
          >
            {item.label}
          </TrackedLink>
        ))}
        {otherLinks.map((item) => (
          <TrackedLink
            key={`${item.href}-${item.label}`}
            href={item.href}
            target={isInternalBookAction(item.kind) ? undefined : "_blank"}
            rel={isInternalBookAction(item.kind) ? undefined : "noopener noreferrer"}
            className={exploreSecondaryButtonClass}
            analytics={analyticsForLink(observatory, item)}
          >
            {item.label}
          </TrackedLink>
        ))}
        <ExploreObservatoryFocusLink
          kind={observatory.kind}
          slug={observatory.slug}
          variant="secondary"
        />
      </div>
    </section>
  );
}

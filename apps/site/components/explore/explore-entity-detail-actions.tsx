"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { exploreSecondaryButtonClass } from "@/components/explore/explore-action-buttons";
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

/** Observatory focus (secondary) and optional purchase/download actions on explore entity detail pages.
 * Related grids already use canonical entity hrefs as primary crawl links.
 */
export function ExploreEntityDetailActions({
  observatory,
  publicationLinks = [],
  ariaLabel,
}: ExploreEntityDetailActionsProps) {
  const label = ariaLabel ?? (publicationLinks.length > 0 ? "Get the book" : "Actions");

  return (
    <section className="mt-10" aria-label={label}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <ExploreObservatoryFocusLink
          kind={observatory.kind}
          slug={observatory.slug}
          variant="secondary"
        />
        {publicationLinks.map((item) => (
          <TrackedLink
            key={`${item.href}-${item.label}`}
            href={item.href}
            target={isInternalBookAction(item.kind) ? undefined : "_blank"}
            rel={isInternalBookAction(item.kind) ? undefined : "noopener noreferrer"}
            className={exploreSecondaryButtonClass}
            analytics={
              item.kind === "download"
                ? {
                    event: "file_download",
                    params: {
                      file_extension: fileExtensionFromUrl(item.href),
                      file_name: item.label,
                      link_url: item.href,
                      content_type: "book",
                      item_id: observatory.slug,
                    },
                  }
                : isInternalBookAction(item.kind)
                  ? {
                      event: "select_content",
                      params: {
                        content_type: "book",
                        item_id: observatory.slug,
                        method: "link",
                      },
                    }
                  : {
                      event: "click",
                      params: {
                        link_url: item.href,
                        link_text: item.label,
                        outbound: true,
                        location: "explore_entity_detail",
                        platform: "book_retailer",
                      },
                    }
            }
          >
            {item.label}
          </TrackedLink>
        ))}
      </div>
    </section>
  );
}

"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  explorePrimaryButtonClass,
  exploreSecondaryButtonClass,
} from "@/components/explore/explore-action-buttons";
import { ExploreObservatoryFocusLink } from "@/components/explore/explore-observatory-focus-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import type { OrderedBookActions } from "@/lib/books/semantic-book-action-links";

type BookOverviewActionsProps = {
  bookId: string;
  bookSlug: string;
  actions: OrderedBookActions;
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

function analyticsForSecondary(bookId: string, item: NonNullable<OrderedBookActions["primary"]>) {
  if (item.kind === "download") {
    return {
      event: AnalyticsEvents.fileDownload,
      params: {
        file_extension: fileExtensionFromUrl(item.href),
        file_name: item.label,
        link_url: item.href,
        content_type: "book" as const,
        item_id: bookId,
      },
    };
  }
  if (item.kind === "purchase") {
    return {
      event: AnalyticsEvents.outboundClick,
      params: {
        link_url: item.href,
        link_text: item.label,
        outbound: true as const,
        location: "book_overview",
        platform: "book_retailer",
      },
    };
  }
  return {
    event: AnalyticsEvents.bookOverviewRelatedSelect,
    params: {
      book_id: bookId,
      destination_id: item.href,
      destination_kind: "book" as const,
    },
  };
}

/** Primary + secondary format/purchase actions for redesigned book overviews. */
export function BookOverviewActions({ bookId, bookSlug, actions }: BookOverviewActionsProps) {
  const { primary, secondary } = actions;
  const hasPublication = Boolean(primary) || secondary.length > 0;

  return (
    <section className="mt-10 space-y-4" aria-label={hasPublication ? "Get the book" : "Actions"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {primary ? (
          <TrackedLink
            href={primary.href}
            target={primary.kind === "navigate" ? undefined : "_blank"}
            rel={primary.kind === "navigate" ? undefined : "noopener noreferrer"}
            className={explorePrimaryButtonClass}
            analytics={{
              event: AnalyticsEvents.bookOverviewPrimaryAction,
              params: {
                book_id: bookId,
                action_kind: primary.kind,
              },
            }}
          >
            {primary.label}
          </TrackedLink>
        ) : (
          <ExploreObservatoryFocusLink kind="book" slug={bookSlug} variant="primary" />
        )}
        {secondary.map((item) => (
          <TrackedLink
            key={`${item.href}-${item.label}`}
            href={item.href}
            target={item.kind === "navigate" ? undefined : "_blank"}
            rel={item.kind === "navigate" ? undefined : "noopener noreferrer"}
            className={exploreSecondaryButtonClass}
            analytics={analyticsForSecondary(bookId, item)}
          >
            {item.label}
          </TrackedLink>
        ))}
        {primary ? (
          <ExploreObservatoryFocusLink kind="book" slug={bookSlug} variant="secondary" />
        ) : null}
      </div>
      {hasPublication ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Offered under open publishing terms (CC BY-SA). Download formats are free where available;
          purchase links support print editions.
        </p>
      ) : null}
    </section>
  );
}

"use client";

import { CorpusNavigationRegion } from "@/components/analytics/corpus-navigation-region";

import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  explorePrimaryButtonClass,
  exploreSecondaryButtonClass,
} from "@/components/explore/explore-action-buttons";
import { ExploreObservatoryFocusLink } from "@/components/explore/explore-observatory-focus-link";
import { ArrowSquareOutIcon } from "@/components/icons/approved";
import { bookActionIconForKind } from "@/components/icons/semantic";
import { SiteIcon } from "@/components/icons/site-icon";
import { BookFavoriteControl } from "@/components/reading/book-favorite-control";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackReaderEvent } from "@/lib/analytics/reader";
import {
  isInternalBookAction,
  type OrderedBookActions,
} from "@/lib/books/semantic-book-action-links";

type BookOverviewActionsProps = {
  bookId: string;
  bookSlug: string;
  actions: OrderedBookActions;
};

type BookActionItem = NonNullable<OrderedBookActions["primary"]>;

export function fileExtensionFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const ext = path.split(".").pop();
    return ext && ext.length <= 5 ? ext.toLowerCase() : "file";
  } catch {
    return "file";
  }
}

export function trackBookOverviewDownload(bookId: string, item: Pick<BookActionItem, "href" | "label">): void {
  trackReaderEvent({
    name: "book_download",
    properties: {
      book_id: bookId,
      format: fileExtensionFromUrl(item.href),
      file_name: item.label,
      link_url: item.href,
      location: "book_overview",
    },
  });
}

function analyticsForSecondary(bookId: string, item: BookActionItem) {
  if (item.kind === "download") {
    // Dual-write via onClick + trackBookOverviewDownload.
    return undefined;
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
  if (item.kind === "read") {
    return {
      event: AnalyticsEvents.bookOverviewPrimaryAction,
      params: {
        book_id: bookId,
        action_kind: item.kind,
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

function ActionLabel({
  kind,
  label,
  external,
}: {
  kind: string;
  label: string;
  external: boolean;
}) {
  const Leading = bookActionIconForKind(kind);
  return (
    <span className="inline-flex items-center gap-2">
      {Leading ? <SiteIcon icon={Leading} size="sm" /> : null}
      <span>{label}</span>
      {external ? <SiteIcon icon={ArrowSquareOutIcon} size="sm" className="opacity-80" /> : null}
    </span>
  );
}

/** Primary + secondary format/purchase actions for redesigned book overviews. */
export function BookOverviewActions({ bookId, bookSlug, actions }: BookOverviewActionsProps) {
  const { primary, secondary } = actions;
  const hasPublication = Boolean(primary) || secondary.length > 0;

  return (
    <CorpusNavigationRegion
      as="section"
      fromType="book"
      relation="read"
      className="mt-6 space-y-4 md:mt-10"
      aria-label={hasPublication ? "Read or get the book" : "Actions"}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {primary ? (
          <TrackedLink
            href={primary.href}
            target={isInternalBookAction(primary.kind) ? undefined : "_blank"}
            rel={isInternalBookAction(primary.kind) ? undefined : "noopener noreferrer"}
            className={explorePrimaryButtonClass}
            analytics={{
              event: AnalyticsEvents.bookOverviewPrimaryAction,
              params: {
                book_id: bookId,
                action_kind: primary.kind,
              },
            }}
            onClick={
              primary.kind === "download"
                ? () => {
                    trackBookOverviewDownload(bookId, primary);
                  }
                : undefined
            }
          >
            <ActionLabel
              kind={primary.kind}
              label={primary.label}
              external={!isInternalBookAction(primary.kind)}
            />
          </TrackedLink>
        ) : (
          <ExploreObservatoryFocusLink kind="book" slug={bookSlug} variant="primary" />
        )}
        {secondary.map((item) => (
          <TrackedLink
            key={`${item.href}-${item.label}`}
            href={item.href}
            target={isInternalBookAction(item.kind) ? undefined : "_blank"}
            rel={isInternalBookAction(item.kind) ? undefined : "noopener noreferrer"}
            className={exploreSecondaryButtonClass}
            analytics={analyticsForSecondary(bookId, item)}
            onClick={
              item.kind === "download"
                ? () => {
                    trackBookOverviewDownload(bookId, item);
                  }
                : undefined
            }
          >
            <ActionLabel
              kind={item.kind}
              label={item.label}
              external={!isInternalBookAction(item.kind)}
            />
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
      <BookFavoriteControl bookId={bookId} className="pt-1" />
    </CorpusNavigationRegion>
  );
}

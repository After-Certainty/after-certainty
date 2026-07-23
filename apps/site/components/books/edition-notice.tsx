import { TrackedLink } from "@/components/analytics/tracked-link";
import { EditionNoticeViewBeacon } from "@/components/books/edition-notice-view-beacon";
import { AnalyticsEvents } from "@/lib/analytics/events";
import type { EditionRelationship } from "@/lib/books/publication-registry-schema";
import { formatPublicationMonthYear, publicStatusLabel } from "@/lib/books/public-status";
import type { BookStatus } from "@/types/content";

export type EditionNoticeProps = {
  bookId: string;
  status: BookStatus;
  relationship: EditionRelationship;
  editionLabel?: string;
  /** Related primary/current edition for companion or superseded pages. */
  relatedHref?: string;
  relatedTitle?: string;
  /** Optional companion link from a primary multi-volume page. */
  companionHref?: string;
  companionTitle?: string;
  firstPublishedAt?: string;
  revisedAt?: string;
  changeSummary?: string;
};

/**
 * Prominent edition/status notice for book detail pages.
 * Companion and superseded states get an alert-style callout with an explicit text link.
 */
export function EditionNotice({
  bookId,
  status,
  relationship,
  editionLabel,
  relatedHref,
  relatedTitle,
  companionHref,
  companionTitle,
  firstPublishedAt,
  revisedAt,
  changeSummary,
}: EditionNoticeProps) {
  const upcoming = publicStatusLabel(status);
  const firstPublished = firstPublishedAt
    ? formatPublicationMonthYear(firstPublishedAt)
    : undefined;
  const revised = revisedAt ? formatPublicationMonthYear(revisedAt) : undefined;

  const showSuperseded = relationship === "superseded" && Boolean(relatedHref);
  const showCompanion = relationship === "companion" && Boolean(relatedHref);
  const showPrimaryCompanion = relationship === "primary" && Boolean(companionHref);
  const showUpcoming = Boolean(upcoming);
  const showDates = Boolean(firstPublished || revised);

  if (!showSuperseded && !showCompanion && !showPrimaryCompanion && !showUpcoming && !showDates) {
    return null;
  }

  const noticeKind = showSuperseded
    ? "superseded"
    : showCompanion
      ? "companion"
      : showPrimaryCompanion
        ? "primary_companion"
        : showUpcoming
          ? "upcoming"
          : "dates";

  return (
    <div className="mt-6 space-y-3">
      <EditionNoticeViewBeacon bookId={bookId} notice={noticeKind} />
      {showSuperseded ? (
        <div
          role="status"
          className="rounded-md border border-border/50 bg-bg-elevated/40 px-4 py-3 text-sm leading-relaxed text-muted"
        >
          <p className="font-medium text-fg">This edition has been superseded</p>
          <p className="mt-1">
            Continue to the current edition
            {relatedTitle ? (
              <>
                :{" "}
                <TrackedLink
                  href={relatedHref!}
                  className="text-accent underline-offset-4 transition-colors hover:text-fg hover:underline"
                  analytics={{
                    event: AnalyticsEvents.editionCurrentSelect,
                    params: {
                      book_id: bookId,
                      destination: relatedHref!,
                      notice: "superseded",
                    },
                  }}
                >
                  {relatedTitle}
                </TrackedLink>
              </>
            ) : (
              <>
                {" "}
                <TrackedLink
                  href={relatedHref!}
                  className="text-accent underline-offset-4 transition-colors hover:text-fg hover:underline"
                  analytics={{
                    event: AnalyticsEvents.editionCurrentSelect,
                    params: {
                      book_id: bookId,
                      destination: relatedHref!,
                      notice: "superseded",
                    },
                  }}
                >
                  here
                </TrackedLink>
              </>
            )}
            .
          </p>
        </div>
      ) : null}

      {showCompanion ? (
        <div
          role="status"
          className="rounded-md border border-border/50 bg-bg-elevated/40 px-4 py-3 text-sm leading-relaxed text-muted"
        >
          <p className="font-medium text-fg">{editionLabel ?? "Companion edition"}</p>
          <p className="mt-1">
            This is a companion volume
            {relatedTitle ? (
              <>
                {" "}
                to{" "}
                <TrackedLink
                  href={relatedHref!}
                  className="text-accent underline-offset-4 transition-colors hover:text-fg hover:underline"
                  analytics={{
                    event: AnalyticsEvents.editionCompanionSelect,
                    params: {
                      book_id: bookId,
                      destination: relatedHref!,
                      notice: "companion",
                    },
                  }}
                >
                  {relatedTitle}
                </TrackedLink>
              </>
            ) : null}
            . It is not a replacement for the primary volume.
          </p>
        </div>
      ) : null}

      {showPrimaryCompanion ? (
        <p className="text-sm text-muted">
          Companion volume available
          {companionTitle ? (
            <>
              :{" "}
              <TrackedLink
                href={companionHref!}
                className="text-accent underline-offset-4 transition-colors hover:text-fg hover:underline"
                analytics={{
                  event: AnalyticsEvents.editionCompanionSelect,
                  params: {
                    book_id: bookId,
                    destination: companionHref!,
                    notice: "primary_companion_link",
                  },
                }}
              >
                {companionTitle}
              </TrackedLink>
            </>
          ) : null}
          .
        </p>
      ) : null}

      {showUpcoming ? (
        <div
          role="status"
          className="rounded-md border border-border/50 bg-bg-elevated/40 px-4 py-3 text-sm leading-relaxed text-muted"
        >
          <p className="font-medium text-fg">Upcoming</p>
          <p className="mt-1">
            This book is announced but not yet the primary reading destination.
          </p>
        </div>
      ) : null}

      {showDates ? (
        <p className="text-sm text-muted">
          {firstPublished ? <>First published {firstPublished}</> : null}
          {firstPublished && revised ? <span aria-hidden> · </span> : null}
          {revised ? <>Substantially revised {revised}</> : null}
          {changeSummary ? <span className="mt-1 block text-muted/90">{changeSummary}</span> : null}
        </p>
      ) : null}
    </div>
  );
}

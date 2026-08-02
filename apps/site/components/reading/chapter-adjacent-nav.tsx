import { ReaderChapterLink } from "@/components/reading/reader-chapter-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import type { ChapterNavLink } from "@/lib/reading/chapter-navigation";

export type ChapterAdjacentNavProps = {
  prev?: ChapterNavLink;
  next?: ChapterNavLink;
  /** Distinguish duplicate prev/next navs when both top and bottom are present. */
  ariaLabel?: string;
  className?: string;
  /** Book id for next_chapter analytics (ANALYTICS-001). */
  bookId?: string;
  /** Current chapter id — from_chapter_id for next_chapter. */
  fromChapterId?: string;
};

/**
 * Previous / next chapter controls in edition reading order (READ-004).
 * Uses full-document links so Mobile Safari Listen to Page / Speak Screen
 * reloads against the new chapter instead of staying on the previous one.
 */
export function ChapterAdjacentNav({
  prev,
  next,
  ariaLabel = "Previous and next chapter",
  className = "flex flex-row items-start justify-between gap-4 sm:gap-10",
  bookId,
  fromChapterId,
}: ChapterAdjacentNavProps) {
  if (!prev && !next) return null;

  const nextAnalytics =
    bookId && fromChapterId && next
      ? {
          event: AnalyticsEvents.nextChapter,
          params: {
            book_id: bookId,
            from_chapter_id: fromChapterId,
            to_chapter_id: next.id,
          },
        }
      : undefined;

  return (
    <nav aria-label={ariaLabel} className={className}>
      <div className="min-w-0 flex-1 sm:max-w-[min(100%,28rem)]">
        {prev ? (
          <ReaderChapterLink
            href={prev.href}
            className="group block text-left"
            aria-label={`Previous chapter: ${prev.title}`}
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted">Previous</span>
            <span className="mt-1 block font-display text-base font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent sm:text-lg">
              <span aria-hidden className="text-muted group-hover:text-accent">
                ←{" "}
              </span>
              {prev.title}
            </span>
          </ReaderChapterLink>
        ) : (
          <span className="text-[11px] uppercase tracking-[0.28em] text-muted/50">Beginning</span>
        )}
      </div>
      <div className="min-w-0 flex-1 text-right sm:max-w-[min(100%,28rem)]">
        {next ? (
          <ReaderChapterLink
            href={next.href}
            className="group ml-auto block max-w-full text-right"
            aria-label={`Next chapter: ${next.title}`}
            analytics={nextAnalytics}
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted">Next</span>
            <span className="mt-1 block font-display text-base font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent sm:text-lg">
              {next.title}
              <span aria-hidden className="text-muted group-hover:text-accent">
                {" "}
                →
              </span>
            </span>
          </ReaderChapterLink>
        ) : (
          <span className="text-[11px] uppercase tracking-[0.28em] text-muted/50">End</span>
        )}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { computeScrollProgress, formatScrollPercent } from "@/lib/reading/scroll-progress";

export type ReadingProgressChromeProps = {
  bookTitle: string;
  bookHref: string;
  /** 1-based chapter index in public reading order when known. */
  chapterIndex?: number;
  /** Total public chapters when known. */
  chapterCount?: number;
  /** Element id of the manuscript container (default: chapter-content). */
  contentId?: string;
};

/**
 * Sticky reader chrome: exit to book, chapter position, and scroll % through the chapter.
 * No fabricated page counts — progress is chapter index + scroll through `#chapter-content`.
 */
export function ReadingProgressChrome({
  bookTitle,
  bookHref,
  chapterIndex,
  chapterCount,
  contentId = "chapter-content",
}: ReadingProgressChromeProps) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      const content = document.getElementById(contentId);
      if (!content) {
        setPercent(0);
        return;
      }
      const rect = content.getBoundingClientRect();
      const contentOffsetTop = rect.top + window.scrollY;
      const progress = computeScrollProgress({
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        contentOffsetTop,
        contentHeight: content.offsetHeight,
      });
      setPercent(formatScrollPercent(progress));
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [contentId]);

  const hasChapterPosition =
    typeof chapterIndex === "number" &&
    chapterIndex > 0 &&
    typeof chapterCount === "number" &&
    chapterCount > 0;

  return (
    <div
      data-testid="reading-progress-chrome"
      className="sticky top-16 z-40 -mx-4 mb-6 border-b border-border/40 bg-bg/90 px-4 backdrop-blur-md md:-mx-0 md:mb-8"
    >
      <div className="flex min-h-11 items-center justify-between gap-3 py-2">
        <Link
          href={bookHref}
          className="min-w-0 truncate text-sm text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-testid="reader-exit"
        >
          <span aria-hidden className="mr-1.5 text-muted">
            ←
          </span>
          <span className="sr-only">Exit reader: back to </span>
          {bookTitle}
        </Link>
        <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
          {hasChapterPosition ? (
            <p
              data-testid="reader-chapter-position"
              className="tabular-nums tracking-wide"
              aria-label={`Chapter ${chapterIndex} of ${chapterCount}`}
            >
              <span aria-hidden>
                {chapterIndex} / {chapterCount}
              </span>
            </p>
          ) : null}
          <p
            data-testid="reader-scroll-percent"
            className="tabular-nums tracking-wide"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">Chapter scroll progress: </span>
            {percent}%
          </p>
        </div>
      </div>
      <div
        className="h-[var(--reader-progress-h,2px)] overflow-hidden bg-border/40"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Chapter scroll progress"
        data-testid="reader-scroll-progressbar"
      >
        <div
          className="h-full bg-accent transition-[width] duration-150 ease-out motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

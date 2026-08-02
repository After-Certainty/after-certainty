"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ChapterBookmarkControl } from "@/components/reading/reading-bookmarks-panel";
import { computeScrollProgress, formatScrollPercent } from "@/lib/reading/scroll-progress";

export type ReaderToolbarProps = {
  bookTitle: string;
  bookHref: string;
  chapterTitle: string;
  editionId: string;
  chapterId: string;
  /** 1-based chapter index in public reading order when known. */
  chapterIndex?: number;
  /** Total public chapters when known. */
  chapterCount?: number;
  contentId?: string;
  onOpenControls: (tab?: "text" | "contents" | "theme" | "settings") => void;
};

/**
 * Compact sticky reader toolbar: contents, exit, bookmark, overflow, progress.
 * Sits at the top of the viewport (site header is omitted on reader routes).
 */
export function ReaderToolbar({
  bookTitle,
  bookHref,
  chapterTitle,
  editionId,
  chapterId,
  chapterIndex,
  chapterCount,
  contentId = "chapter-content",
  onOpenControls,
}: ReaderToolbarProps) {
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
      className="reader-toolbar sticky top-0 z-40 border-b border-border/40 bg-bg/95 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex h-12 items-center gap-2 px-3 sm:px-4">
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-fg transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Open reader controls"
          data-testid="reader-controls-open"
          onClick={() => onOpenControls("text")}
        >
          <span aria-hidden className="flex flex-col gap-[5px]">
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
          </span>
        </button>

        <Link
          href={bookHref}
          className="min-w-0 flex-1 truncate text-center font-display text-sm text-fg/90 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-base"
          data-testid="reader-exit"
        >
          <span className="sr-only">Exit reader: back to </span>
          {bookTitle}
        </Link>

        <div className="flex shrink-0 items-center">
          <ChapterBookmarkControl
            editionId={editionId}
            chapterId={chapterId}
            chapterTitle={chapterTitle}
            variant="icon"
          />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-lg leading-none text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Open reader settings"
            data-testid="reader-overflow-open"
            onClick={() => onOpenControls("settings")}
          >
            <span aria-hidden>⋯</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-3 pb-1.5 pt-0.5 text-[11px] text-muted sm:px-4">
        <div className="flex shrink-0 items-center gap-2.5 tabular-nums tracking-wide">
          {hasChapterPosition ? (
            <p
              data-testid="reader-chapter-position"
              aria-label={`Chapter ${chapterIndex} of ${chapterCount}`}
            >
              <span aria-hidden>
                {chapterIndex} / {chapterCount}
              </span>
            </p>
          ) : null}
          <p
            data-testid="reader-scroll-percent"
            className="tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">Chapter scroll progress: </span>
            {percent}%
          </p>
        </div>
        <p className="min-w-0 truncate text-right text-fg/75" title={chapterTitle}>
          {chapterTitle}
        </p>
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

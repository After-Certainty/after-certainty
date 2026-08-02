"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useSyncExternalStore } from "react";

import {
  clearReadingPreferences,
  DEFAULT_READING_PREFERENCES,
  getReadingPreferences,
  READING_LINE_HEIGHT_LABELS,
  READING_LINE_HEIGHT_VALUES,
  READING_LINE_HEIGHTS,
  READING_TEXT_SIZE_LABELS,
  READING_TEXT_SIZE_REMS,
  READING_TEXT_SIZES,
  READING_WIDTH_CLASSNAMES,
  READING_WIDTH_LABELS,
  READING_WIDTHS,
  setReadingLineHeight,
  setReadingTextSize,
  setReadingWidth,
  subscribeReadingPreferences,
  type ReadingLineHeight,
  type ReadingPreferences,
  type ReadingTextSize,
  type ReadingWidth,
} from "@/lib/reading/readingPreferences";

const SERVER_SNAPSHOT: ReadingPreferences = {
  ...DEFAULT_READING_PREFERENCES,
  updatedAt: new Date(0).toISOString(),
};

function useReadingPreferences(): ReadingPreferences {
  return useSyncExternalStore(
    subscribeReadingPreferences,
    getReadingPreferences,
    () => SERVER_SNAPSHOT,
  );
}

type ReadingPreferencesRootProps = {
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "style">;

/**
 * Article wrapper that applies reader-local appearance prefs (READ-014 + Phase F).
 * Sets CSS vars / data attrs so size, line-height, and width win over prose utilities.
 */
export function ReadingPreferencesRoot({
  children,
  className = "",
  ...props
}: ReadingPreferencesRootProps) {
  const prefs = useReadingPreferences();
  const widthClass = READING_WIDTH_CLASSNAMES[prefs.readingWidth];

  return (
    <article
      {...props}
      className={`chapter-reader ${widthClass} ${className}`.trim()}
      data-reading-size={prefs.textSize}
      data-reading-line-height={prefs.lineHeight}
      data-reading-width={prefs.readingWidth}
      style={
        {
          ["--reader-font-size" as string]: READING_TEXT_SIZE_REMS[prefs.textSize],
          ["--reader-line-height" as string]: READING_LINE_HEIGHT_VALUES[prefs.lineHeight],
        } as HTMLAttributes<HTMLElement>["style"]
      }
    >
      {children}
    </article>
  );
}

function cycleTextSize(current: ReadingTextSize, delta: -1 | 1): ReadingTextSize {
  const index = READING_TEXT_SIZES.indexOf(current);
  const next = Math.min(READING_TEXT_SIZES.length - 1, Math.max(0, index + delta));
  return READING_TEXT_SIZES[next]!;
}

function cycleLineHeight(current: ReadingLineHeight, delta: -1 | 1): ReadingLineHeight {
  const index = READING_LINE_HEIGHTS.indexOf(current);
  const next = Math.min(READING_LINE_HEIGHTS.length - 1, Math.max(0, index + delta));
  return READING_LINE_HEIGHTS[next]!;
}

function cycleWidth(current: ReadingWidth, delta: -1 | 1): ReadingWidth {
  const index = READING_WIDTHS.indexOf(current);
  const next = Math.min(READING_WIDTHS.length - 1, Math.max(0, index + delta));
  return READING_WIDTHS[next]!;
}

/**
 * Appearance controls for chapter chrome (device-only; site light/dark remains global).
 */
export function ReadingPreferencesControls() {
  const prefs = useReadingPreferences();

  return (
    <div className="space-y-3" data-testid="reading-preferences-controls">
      <div
        className="reading-prefs flex flex-wrap items-center gap-2 rounded-sm border border-border/50 bg-bg-elevated/30 px-4 py-3"
        role="group"
        aria-label="Text size"
      >
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted">Text</span>
        <button
          type="button"
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-sm border border-border/60 px-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          aria-label="Decrease text size"
          disabled={prefs.textSize === "sm"}
          onClick={() => setReadingTextSize(cycleTextSize(prefs.textSize, -1))}
        >
          A−
        </button>
        <span className="min-w-[5.5rem] text-center text-xs text-fg/85" aria-live="polite">
          {READING_TEXT_SIZE_LABELS[prefs.textSize]}
        </span>
        <button
          type="button"
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-sm border border-border/60 px-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          aria-label="Increase text size"
          disabled={prefs.textSize === "xl"}
          onClick={() => setReadingTextSize(cycleTextSize(prefs.textSize, 1))}
        >
          A+
        </button>
      </div>

      <div
        className="reading-prefs flex flex-wrap items-center gap-2 rounded-sm border border-border/50 bg-bg-elevated/30 px-4 py-3"
        role="group"
        aria-label="Line spacing"
      >
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted">Spacing</span>
        <button
          type="button"
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-sm border border-border/60 px-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          aria-label="Decrease line spacing"
          disabled={prefs.lineHeight === "compact"}
          onClick={() => setReadingLineHeight(cycleLineHeight(prefs.lineHeight, -1))}
        >
          −
        </button>
        <span className="min-w-[6.5rem] text-center text-xs text-fg/85" aria-live="polite">
          {READING_LINE_HEIGHT_LABELS[prefs.lineHeight]}
        </span>
        <button
          type="button"
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-sm border border-border/60 px-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          aria-label="Increase line spacing"
          disabled={prefs.lineHeight === "relaxed"}
          onClick={() => setReadingLineHeight(cycleLineHeight(prefs.lineHeight, 1))}
        >
          +
        </button>
      </div>

      <div
        className="reading-prefs flex flex-wrap items-center gap-2 rounded-sm border border-border/50 bg-bg-elevated/30 px-4 py-3"
        role="group"
        aria-label="Reading width"
      >
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted">Width</span>
        <button
          type="button"
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-sm border border-border/60 px-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          aria-label="Decrease reading width"
          disabled={prefs.readingWidth === "narrow"}
          onClick={() => setReadingWidth(cycleWidth(prefs.readingWidth, -1))}
        >
          −
        </button>
        <span className="min-w-[5.5rem] text-center text-xs text-fg/85" aria-live="polite">
          {READING_WIDTH_LABELS[prefs.readingWidth]}
        </span>
        <button
          type="button"
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-sm border border-border/60 px-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          aria-label="Increase reading width"
          disabled={prefs.readingWidth === "wide"}
          onClick={() => setReadingWidth(cycleWidth(prefs.readingWidth, 1))}
        >
          +
        </button>
      </div>

      <p className="text-xs text-muted">
        Appearance is saved on this device only.{" "}
        <button
          type="button"
          className="underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={() => clearReadingPreferences()}
        >
          Reset appearance
        </button>
      </p>
    </div>
  );
}

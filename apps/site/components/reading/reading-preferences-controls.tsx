"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useSyncExternalStore } from "react";

import {
  getReadingPreferences,
  READING_TEXT_SIZE_LABELS,
  READING_TEXT_SIZE_REMS,
  READING_TEXT_SIZES,
  setReadingTextSize,
  subscribeReadingPreferences,
  type ReadingPreferences,
  type ReadingTextSize,
} from "@/lib/reading/readingPreferences";

const SERVER_SNAPSHOT: ReadingPreferences = {
  textSize: "md",
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
 * Article wrapper that applies reader-local text-size (READ-014).
 * Sets `--reader-font-size` inline so size wins over Typography utilities.
 */
export function ReadingPreferencesRoot({
  children,
  className = "",
  ...props
}: ReadingPreferencesRootProps) {
  const prefs = useReadingPreferences();

  return (
    <article
      {...props}
      className={`chapter-reader ${className}`.trim()}
      data-reading-size={prefs.textSize}
      style={
        {
          ["--reader-font-size" as string]: READING_TEXT_SIZE_REMS[prefs.textSize],
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

/**
 * Text size controls for chapter chrome (site light/dark remains global).
 */
export function ReadingPreferencesControls() {
  const prefs = useReadingPreferences();

  return (
    <div
      className="reading-prefs flex flex-wrap items-center gap-2 rounded-sm border border-border/50 bg-bg-elevated/30 px-4 py-3"
      data-testid="reading-preferences-controls"
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
  );
}

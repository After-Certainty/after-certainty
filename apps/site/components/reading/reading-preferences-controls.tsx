"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useSyncExternalStore } from "react";

import {
  getReadingPreferences,
  READING_TEXT_SIZE_LABELS,
  READING_TEXT_SIZES,
  READING_THEME_LABELS,
  READING_THEMES,
  setReadingTextSize,
  setReadingTheme,
  subscribeReadingPreferences,
  type ReadingPreferences,
  type ReadingTextSize,
  type ReadingTheme,
} from "@/lib/reading/readingPreferences";

const SERVER_SNAPSHOT: ReadingPreferences = {
  textSize: "md",
  theme: "inherit",
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
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className">;

/**
 * Article wrapper that applies reader-local size/theme data attributes (READ-014).
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
      data-reading-theme={prefs.theme}
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
 * Text size + reading theme controls for chapter chrome.
 */
export function ReadingPreferencesControls() {
  const prefs = useReadingPreferences();

  return (
    <div
      className="reading-prefs flex flex-col gap-3 rounded-sm border border-border/50 bg-bg-elevated/30 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
      data-testid="reading-preferences-controls"
    >
      <div
        className="flex flex-wrap items-center gap-2"
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
        className="flex flex-wrap items-center gap-2"
        role="radiogroup"
        aria-label="Reading theme"
      >
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted">Theme</span>
        {READING_THEMES.map((theme) => {
          const selected = prefs.theme === theme;
          return (
            <button
              key={theme}
              type="button"
              role="radio"
              aria-checked={selected}
              className={
                selected
                  ? "inline-flex h-8 items-center rounded-sm border border-accent/55 bg-accent-soft px-3 text-xs uppercase tracking-[0.14em] text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  : "inline-flex h-8 items-center rounded-sm border border-border/60 px-3 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              }
              onClick={() => setReadingTheme(theme as ReadingTheme)}
            >
              {READING_THEME_LABELS[theme]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

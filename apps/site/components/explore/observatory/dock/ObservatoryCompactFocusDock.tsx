"use client";

import type { ReactNode } from "react";

type ObservatoryCompactFocusDockProps = {
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  onSummaryClick: () => void;
  children: ReactNode;
};

function ChevronIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
      {direction === "up" ? (
        <path
          d="M2.5 7.5 6 4l3.5 3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M2.5 4.5 6 8l3.5-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function ObservatoryCompactFocusDock({
  summary,
  isOpen,
  onToggle,
  onSummaryClick,
  children,
}: ObservatoryCompactFocusDockProps) {
  return (
    <section className="shrink-0 border-t border-border/30 bg-bg/98">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <button
          type="button"
          id="observatory-compact-focus-toggle"
          className="flex shrink-0 items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-accent underline-offset-4 transition-colors hover:underline"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="observatory-compact-focus-panel"
          aria-label={isOpen ? "Collapse focus" : "Expand focus"}
        >
          <ChevronIcon direction={isOpen ? "down" : "up"} />
          Focus
        </button>
        {!isOpen ? (
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left font-display text-sm text-fg/90 transition-colors hover:text-accent"
            onClick={onSummaryClick}
            aria-label={`Expand focus: ${summary}`}
          >
            {summary}
          </button>
        ) : (
          <p className="min-w-0 flex-1 truncate font-display text-sm text-fg/90">{summary}</p>
        )}
      </div>

      {isOpen ? (
        <div
          id="observatory-compact-focus-panel"
          role="region"
          aria-labelledby="observatory-compact-focus-toggle"
          className="max-h-[42vh] overflow-y-auto border-t border-border/20 px-4 py-4"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

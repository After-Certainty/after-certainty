"use client";

import type { ReactNode } from "react";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";

type BookOverviewEditionHistoryProps = {
  bookId: string;
  children: ReactNode;
  summary?: string;
};

/** Multi-volume / revision disclosure with analytics on open. */
export function BookOverviewEditionHistory({
  bookId,
  children,
  summary = "Edition and updates",
}: BookOverviewEditionHistoryProps) {
  return (
    <details
      className="group rounded-md border border-border/40 bg-bg-elevated/20 px-4 py-3"
      onToggle={(event) => {
        if (event.currentTarget.open) {
          trackEvent(AnalyticsEvents.bookOverviewEditionHistoryOpen, { book_id: bookId });
        }
      }}
    >
      <summary className="cursor-pointer list-none font-display text-lg font-medium tracking-tight text-fg marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          {summary}
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted group-open:hidden">
            Show
          </span>
          <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted group-open:inline">
            Hide
          </span>
        </span>
      </summary>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  );
}

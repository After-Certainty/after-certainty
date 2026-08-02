"use client";

import { useSyncExternalStore } from "react";

import {
  isFavoriteBook,
  subscribeReadingFavorites,
  toggleFavoriteBook,
} from "@/lib/reading/readingFavorites";

type BookFavoriteControlProps = {
  bookId: string;
  /** Optional className for layout in overview/legacy action rows. */
  className?: string;
};

/**
 * Device-only favorite toggle for a book. Renders nothing on the server to avoid hydration mismatch.
 */
export function BookFavoriteControl({ bookId, className = "" }: BookFavoriteControlProps) {
  const favorited = useSyncExternalStore(
    subscribeReadingFavorites,
    () => isFavoriteBook(bookId),
    () => false,
  );
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isClient) return null;

  return (
    <div className={className}>
      <button
        type="button"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-border/70 px-6 py-3 text-sm uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
        aria-pressed={favorited}
        data-testid="book-favorite-control"
        onClick={() => toggleFavoriteBook(bookId)}
      >
        {favorited ? "Remove favorite" : "Save favorite"}
      </button>
      <p className="mt-2 text-xs text-muted">
        Saved on this device only — not synced across devices.
      </p>
    </div>
  );
}

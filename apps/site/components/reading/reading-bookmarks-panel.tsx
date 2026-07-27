"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import type { ContinueReadingCatalog } from "@/lib/reading/continueReading";
import {
  hasReadingBookmark,
  listReadingBookmarksForEdition,
  removeReadingBookmarkByIdentityKey,
  toggleReadingBookmark,
} from "@/lib/reading/readingBookmarks";
import {
  bookmarkDisplayLabel,
  resolveReadingBookmarkTargets,
} from "@/lib/reading/resolveReadingBookmarks";

function subscribeNoop() {
  return () => {};
}

function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function useLocationHash(): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => onStoreChange();
      window.addEventListener("hashchange", handler);
      return () => window.removeEventListener("hashchange", handler);
    },
    () => window.location.hash,
    () => "",
  );
}

function fragmentFromHash(hash: string): string | undefined {
  const raw = hash.replace(/^#/, "").trim();
  return raw.length > 0 ? raw : undefined;
}

function labelForBookmark(chapterTitle: string, fragmentId?: string): string {
  if (!fragmentId || typeof document === "undefined") return chapterTitle;
  const heading = document.getElementById(fragmentId);
  const headingText = heading?.textContent?.trim();
  if (headingText) return headingText;
  return `${chapterTitle} · ${fragmentId}`;
}

type ChapterBookmarkControlProps = {
  editionId: string;
  chapterId: string;
  chapterTitle: string;
};

/**
 * Reader chrome control: bookmark the current chapter (or hashed section).
 */
export function ChapterBookmarkControl({
  editionId,
  chapterId,
  chapterTitle,
}: ChapterBookmarkControlProps) {
  const isClient = useIsClient();
  const hash = useLocationHash();
  const [epoch, setEpoch] = useState(0);

  if (!isClient) return null;

  void epoch;
  const fragment = fragmentFromHash(hash);
  const bookmarked = hasReadingBookmark(editionId, chapterId, fragment);
  const actionLabel = bookmarked
    ? fragment
      ? "Remove section bookmark"
      : "Remove bookmark"
    : fragment
      ? "Bookmark section"
      : "Bookmark chapter";

  return (
    <button
      type="button"
      className="text-xs uppercase tracking-[0.18em] text-muted underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-pressed={bookmarked}
      data-testid="chapter-bookmark-control"
      onClick={() => {
        toggleReadingBookmark({
          editionId,
          chapterId,
          fragmentId: fragment ?? null,
          label: labelForBookmark(chapterTitle, fragment),
        });
        setEpoch((value) => value + 1);
      }}
    >
      {actionLabel}
    </button>
  );
}

type BookmarksForBookProps = {
  editionId: string;
  catalog: ContinueReadingCatalog;
};

/**
 * Book overview bookmark list (READ-013). Hidden when no valid bookmarks.
 */
export function BookmarksForBook({ editionId, catalog }: BookmarksForBookProps) {
  const isClient = useIsClient();
  const [epoch, setEpoch] = useState(0);

  if (!isClient) return null;

  void epoch;
  const editionKeys = new Set<string>([editionId]);
  const edition = catalog[editionId];
  if (edition?.editionId) editionKeys.add(edition.editionId);

  const entries = [...editionKeys].flatMap((key) => listReadingBookmarksForEdition(key));
  const seen = new Set<string>();
  const unique = entries.filter((entry) => {
    if (seen.has(entry.identityKey)) return false;
    seen.add(entry.identityKey);
    return true;
  });
  const targets = resolveReadingBookmarkTargets(unique, catalog);
  if (!targets.length) return null;

  return (
    <div
      className="mt-8 space-y-3 rounded-sm border border-border/50 bg-bg-elevated/30 px-4 py-4"
      data-testid="bookmarks-for-book"
    >
      <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted">Bookmarks</h2>
      <ul className="space-y-3">
        {targets.map((target) => (
          <li
            key={target.identityKey}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={target.href}
                className="text-fg underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {bookmarkDisplayLabel(target)}
              </Link>
              {target.fragmentId ? (
                <p className="mt-0.5 text-xs text-muted">{target.chapterTitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-xs uppercase tracking-[0.18em] text-muted underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => {
                removeReadingBookmarkByIdentityKey(target.identityKey);
                setEpoch((value) => value + 1);
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

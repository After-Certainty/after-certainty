import {
  continueReadingHref,
  type ContinueReadingCatalog,
} from "@/lib/reading/continueReading";
import type { ReadingBookmarkEntry } from "@/lib/reading/readingBookmarks";

export type ReadingBookmarkTarget = {
  editionId: string;
  chapterId: string;
  bookSlug: string;
  bookTitle: string;
  chapterTitle: string;
  href: string;
  fragmentId?: string;
  label?: string;
  identityKey: string;
  createdAt: string;
};

/**
 * Resolve a stored bookmark against live public chapter routes, or null when stale.
 */
export function resolveReadingBookmarkTarget(
  entry: ReadingBookmarkEntry,
  catalog: ContinueReadingCatalog,
): ReadingBookmarkTarget | null {
  const edition = catalog[entry.editionId];
  if (!edition) return null;
  const chapter = edition.chapters[entry.chapterId];
  if (!chapter) return null;

  return {
    editionId: edition.editionId,
    chapterId: chapter.chapterId,
    bookSlug: edition.bookSlug,
    bookTitle: edition.bookTitle,
    chapterTitle: chapter.chapterTitle,
    href: continueReadingHref(chapter.href, entry.fragmentId),
    identityKey: entry.identityKey,
    createdAt: entry.createdAt,
    ...(entry.fragmentId ? { fragmentId: entry.fragmentId } : {}),
    ...(entry.label ? { label: entry.label } : {}),
  };
}

export function resolveReadingBookmarkTargets(
  entries: readonly ReadingBookmarkEntry[],
  catalog: ContinueReadingCatalog,
): ReadingBookmarkTarget[] {
  const targets: ReadingBookmarkTarget[] = [];
  for (const entry of entries) {
    const target = resolveReadingBookmarkTarget(entry, catalog);
    if (target) targets.push(target);
  }
  return targets;
}

export function bookmarkDisplayLabel(target: ReadingBookmarkTarget): string {
  if (target.label?.trim()) return target.label.trim();
  if (target.fragmentId) return `${target.chapterTitle} · ${target.fragmentId}`;
  return target.chapterTitle;
}

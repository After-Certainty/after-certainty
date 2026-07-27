import {
  chapterPublicPath,
  publicChaptersForEdition,
} from "@/lib/graph/chapters";
import type { ReadingProgressEntry } from "@/lib/reading/readingProgress";
import type { Book, SemanticGraph } from "@/types/semanticGraph";

/**
 * Resolve local reading progress to live chapter destinations (READ-012).
 * Catalog is built on the server; matching against localStorage happens on the client.
 */

export type ContinueReadingCatalogChapter = {
  chapterId: string;
  chapterTitle: string;
  /** Chapter pathname without fragment. */
  href: string;
};

export type ContinueReadingCatalogEdition = {
  editionId: string;
  bookSlug: string;
  bookTitle: string;
  chapters: Record<string, ContinueReadingCatalogChapter>;
};

/** editionId → edition catalog (aliases may point at the same object). */
export type ContinueReadingCatalog = Record<string, ContinueReadingCatalogEdition>;

export type ContinueReadingTarget = {
  editionId: string;
  chapterId: string;
  bookSlug: string;
  bookTitle: string;
  chapterTitle: string;
  /** Chapter route, including `#fragment` when progress has one. */
  href: string;
  fragmentId?: string;
  updatedAt: string;
};

function editionKeysForBook(book: Book): string[] {
  const keys = new Set<string>([book.id]);
  if (book.editionId?.trim()) keys.add(book.editionId.trim());
  return [...keys];
}

/**
 * Slim catalog for a single book page (avoids shipping every edition's chapters).
 */
export function continueReadingCatalogForEdition(
  catalog: ContinueReadingCatalog,
  editionId: string,
): ContinueReadingCatalog {
  const edition = catalog[editionId];
  if (!edition) return {};
  const slim: ContinueReadingCatalog = { [edition.editionId]: edition };
  if (editionId !== edition.editionId) {
    slim[editionId] = edition;
  }
  return slim;
}

/**
 * Build a lean lookup of public chapter destinations for continue-reading CTAs.
 */
export function buildContinueReadingCatalog(graph: SemanticGraph): ContinueReadingCatalog {
  const catalog: ContinueReadingCatalog = {};

  for (const book of graph.books) {
    const chaptersById: Record<string, ContinueReadingCatalogChapter> = {};

    for (const editionKey of editionKeysForBook(book)) {
      for (const chapter of publicChaptersForEdition(graph, editionKey)) {
        const href = chapterPublicPath(chapter);
        if (!href) continue;
        chaptersById[chapter.id] = {
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          href,
        };
      }
    }

    if (Object.keys(chaptersById).length === 0) continue;

    const edition: ContinueReadingCatalogEdition = {
      editionId: book.id,
      bookSlug: book.slug,
      bookTitle: book.title,
      chapters: chaptersById,
    };

    for (const key of editionKeysForBook(book)) {
      catalog[key] = edition;
    }
  }

  return catalog;
}

export function continueReadingHref(
  pathname: string,
  fragmentId?: string | null,
): string {
  const base = pathname.trim();
  if (!base) return base;
  const fragment = fragmentId?.trim().replace(/^#/, "");
  if (!fragment) return base;
  return `${base}#${fragment}`;
}

/**
 * Map a stored progress entry to a live chapter destination, or null when invalid.
 */
export function resolveContinueReadingTarget(
  entry: Pick<ReadingProgressEntry, "editionId" | "chapterId" | "fragmentId" | "updatedAt">,
  catalog: ContinueReadingCatalog,
): ContinueReadingTarget | null {
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
    ...(entry.fragmentId ? { fragmentId: entry.fragmentId } : {}),
    updatedAt: entry.updatedAt,
  };
}

/**
 * Resolve stored progress entries to valid destinations (newest first).
 */
export function resolveContinueReadingTargets(
  entries: readonly Pick<
    ReadingProgressEntry,
    "editionId" | "chapterId" | "fragmentId" | "updatedAt"
  >[],
  catalog: ContinueReadingCatalog,
  limit = Number.POSITIVE_INFINITY,
): ContinueReadingTarget[] {
  const targets: ContinueReadingTarget[] = [];
  const seenEditions = new Set<string>();

  for (const entry of entries) {
    const target = resolveContinueReadingTarget(entry, catalog);
    if (!target) continue;
    if (seenEditions.has(target.editionId)) continue;
    seenEditions.add(target.editionId);
    targets.push(target);
    if (targets.length >= limit) break;
  }

  return targets;
}

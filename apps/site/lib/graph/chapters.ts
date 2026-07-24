import { explorePaths } from "@/lib/graph/explorePaths";
import type { ManifestChapter, ManifestPart, SemanticGraph } from "@/types/semanticGraph";

/**
 * Frozen public chapter URL contract (READ-001).
 * @see docs/semantic-chapter-identity.md
 *
 * Pattern: `/explore/books/{editionSlug}/chapters/{chapterSlug}`
 */
export const CHAPTER_ROUTE_SEGMENTS = {
  explore: "explore",
  books: "books",
  chapters: "chapters",
} as const;

/** Pathname prefix shared by all chapter routeKeys (no trailing slash). */
export const CHAPTER_ROUTE_BOOKS_PREFIX = `${explorePaths.books}` as const;

export type ParsedChapterRouteKey = {
  editionSlug: string;
  chapterSlug: string;
};

const SLUG_SEGMENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/**
 * Build the canonical chapter pathname (also the manifest `routeKey` shape).
 */
export function buildChapterRouteKey(editionSlug: string, chapterSlug: string): string {
  const book = editionSlug.trim().replace(/^\/+|\/+$/g, "");
  const chapter = chapterSlug.trim().replace(/^\/+|\/+$/g, "");
  if (!book || !chapter) {
    throw new Error("buildChapterRouteKey requires non-empty editionSlug and chapterSlug");
  }
  return `${explorePaths.books}/${book}/${CHAPTER_ROUTE_SEGMENTS.chapters}/${chapter}`;
}

/**
 * Parse a chapter `routeKey` into edition + chapter slugs.
 * Returns null when the pathname does not match the frozen contract.
 */
export function parseChapterRouteKey(routeKey: string): ParsedChapterRouteKey | null {
  const trimmed = routeKey.trim().replace(/\/+$/, "");
  if (!trimmed.startsWith("/")) return null;
  const parts = trimmed.split("/").filter(Boolean);
  // explore / books / {editionSlug} / chapters / {chapterSlug}
  if (parts.length !== 5) return null;
  if (parts[0] !== CHAPTER_ROUTE_SEGMENTS.explore) return null;
  if (parts[1] !== CHAPTER_ROUTE_SEGMENTS.books) return null;
  if (parts[3] !== CHAPTER_ROUTE_SEGMENTS.chapters) return null;
  const editionSlug = parts[2] ?? "";
  const chapterSlug = parts[4] ?? "";
  if (!editionSlug || !chapterSlug) return null;
  if (!SLUG_SEGMENT_RE.test(editionSlug) || !SLUG_SEGMENT_RE.test(chapterSlug)) return null;
  return { editionSlug, chapterSlug };
}

/** Last path segment of a chapter `routeKey` (App Router `[chapterSlug]`). */
export function chapterSlugFromRouteKey(routeKey: string): string {
  const parsed = parseChapterRouteKey(routeKey);
  if (parsed) return parsed.chapterSlug;
  const trimmed = routeKey.replace(/\/+$/, "");
  const segment = trimmed.split("/").filter(Boolean).pop();
  return segment && segment.length > 0 ? segment : routeKey;
}

/** True when `routeKey` matches the frozen public chapter pathname shape. */
export function isValidChapterRouteKey(routeKey: string): boolean {
  return parseChapterRouteKey(routeKey) !== null;
}

/**
 * True when `routeKey` is a valid chapter path for the given catalog book slug.
 */
export function chapterRouteKeyMatchesEditionSlug(routeKey: string, editionSlug: string): boolean {
  const parsed = parseChapterRouteKey(routeKey);
  if (!parsed) return false;
  return parsed.editionSlug === editionSlug;
}

/**
 * Canonical public pathname for a chapter record (= `routeKey` when well-formed).
 * Does not imply search/sitemap eligibility (READ-005 / READ-009).
 */
export function chapterPublicPath(chapter: Pick<ManifestChapter, "routeKey">): string | null {
  if (!isValidChapterRouteKey(chapter.routeKey)) return null;
  return chapter.routeKey;
}

/**
 * Stable localStorage / progress key material (future READ-011+).
 * Prefer graph ids over URL strings.
 */
export function chapterReadingStorageKey(editionId: string, chapterId: string): string {
  return `readingProgress:${editionId}:${chapterId}`;
}

export function partsFromGraph(graph: SemanticGraph): ManifestPart[] {
  return [...(graph.parts ?? [])].sort((a, b) => {
    if (a.editionId !== b.editionId) return a.editionId.localeCompare(b.editionId);
    return a.position - b.position;
  });
}

export function chaptersFromGraph(graph: SemanticGraph): ManifestChapter[] {
  return [...(graph.chapters ?? [])].sort((a, b) => {
    if (a.editionId !== b.editionId) return a.editionId.localeCompare(b.editionId);
    return a.position - b.position;
  });
}

export function partsForEdition(graph: SemanticGraph, editionId: string): ManifestPart[] {
  return partsFromGraph(graph).filter((part) => part.editionId === editionId);
}

export function chaptersForEdition(graph: SemanticGraph, editionId: string): ManifestChapter[] {
  return chaptersFromGraph(graph).filter((chapter) => chapter.editionId === editionId);
}

/** Public chapters for an edition in reading order (for future TOC surfaces). */
export function publicChaptersForEdition(
  graph: SemanticGraph,
  editionId: string,
): ManifestChapter[] {
  return chaptersForEdition(graph, editionId).filter((chapter) => chapter.public);
}

export function indexPartsByEditionId(graph: SemanticGraph): Map<string, ManifestPart[]> {
  const byEdition = new Map<string, ManifestPart[]>();
  for (const part of partsFromGraph(graph)) {
    const bucket = byEdition.get(part.editionId) ?? [];
    bucket.push(part);
    byEdition.set(part.editionId, bucket);
  }
  return byEdition;
}

export function indexChaptersByEditionId(graph: SemanticGraph): Map<string, ManifestChapter[]> {
  const byEdition = new Map<string, ManifestChapter[]>();
  for (const chapter of chaptersFromGraph(graph)) {
    const bucket = byEdition.get(chapter.editionId) ?? [];
    bucket.push(chapter);
    byEdition.set(chapter.editionId, bucket);
  }
  return byEdition;
}

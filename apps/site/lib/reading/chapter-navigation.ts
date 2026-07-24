import {
  chapterPublicPath,
  chapterSlugFromRouteKey,
  partsForEdition,
  publicChaptersForEdition,
} from "@/lib/graph/chapters";
import type { Book, ManifestChapter, ManifestPart, SemanticGraph } from "@/types/semanticGraph";

export type ChapterNavLink = {
  id: string;
  title: string;
  href: string;
  chapterSlug: string;
  partId?: string;
  partTitle?: string;
  kind: ManifestChapter["kind"];
};

export type ChapterTocPart = {
  id: string;
  title?: string;
  position: number;
  chapters: ChapterNavLink[];
};

export type ChapterReadingNavigation = {
  editionId: string;
  current: ChapterNavLink;
  prev?: ChapterNavLink;
  next?: ChapterNavLink;
  parts: ChapterTocPart[];
  /** Flat public chapters in reading order. */
  chapters: ChapterNavLink[];
};

function toNavLink(chapter: ManifestChapter): ChapterNavLink | null {
  const href = chapterPublicPath(chapter);
  if (!href) return null;
  return {
    id: chapter.id,
    title: chapter.title,
    href,
    chapterSlug: chapterSlugFromRouteKey(chapter.routeKey),
    partId: chapter.partId,
    partTitle: chapter.partTitle,
    kind: chapter.kind,
  };
}

/**
 * Build prev/next + part/chapter TOC for the Native Reader (READ-004).
 * Only public chapters with valid routeKeys are included.
 */
export function buildChapterReadingNavigation(input: {
  graph: SemanticGraph;
  book: Pick<Book, "id" | "editionId" | "slug">;
  chapterId: string;
}): ChapterReadingNavigation | null {
  const editionId = input.book.editionId ?? input.book.id;
  const ordered = publicChaptersForEdition(input.graph, editionId)
    .slice()
    .sort((a, b) => a.position - b.position);

  const links = ordered.map(toNavLink).filter((link): link is ChapterNavLink => Boolean(link));
  if (links.length === 0) return null;

  const currentIndex = links.findIndex((link) => link.id === input.chapterId);
  if (currentIndex < 0) return null;

  const current = links[currentIndex]!;
  const prev = currentIndex > 0 ? links[currentIndex - 1] : undefined;
  const next = currentIndex < links.length - 1 ? links[currentIndex + 1] : undefined;

  const partsMeta = partsForEdition(input.graph, editionId)
    .slice()
    .sort((a, b) => a.position - b.position);
  const parts = groupNavLinksByPart(partsMeta, links, editionId);

  return {
    editionId,
    current,
    prev,
    next,
    parts,
    chapters: links,
  };
}

export function groupNavLinksByPart(
  parts: ManifestPart[],
  links: ChapterNavLink[],
  editionId: string,
): ChapterTocPart[] {
  const partsWithChapters: ChapterTocPart[] = [];
  const assigned = new Set<string>();

  for (const part of parts) {
    const chapters = links.filter((link) => link.partId === part.id);
    for (const chapter of chapters) assigned.add(chapter.id);
    if (chapters.length === 0) continue;
    partsWithChapters.push({
      id: part.id,
      title: part.title,
      position: part.position,
      chapters,
    });
  }

  const unassigned = links.filter((link) => !assigned.has(link.id));
  if (unassigned.length > 0) {
    if (partsWithChapters.length === 0) {
      partsWithChapters.push({
        id: `${editionId}-all-chapters`,
        position: 0,
        chapters: unassigned,
      });
    } else {
      partsWithChapters.push({
        id: `${editionId}-ungrouped`,
        title: "Other sections",
        position: partsWithChapters.length + 1,
        chapters: unassigned,
      });
    }
  }

  return partsWithChapters;
}

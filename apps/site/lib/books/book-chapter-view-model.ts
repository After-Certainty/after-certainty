import { chaptersForEdition, partsForEdition } from "@/lib/graph/chapters";
import type {
  ManifestChapter,
  ManifestChapterKind,
  ManifestPart,
  SemanticGraph,
} from "@/types/semanticGraph";

export type BookChapterViewModel = {
  id: string;
  title: string;
  kind: ManifestChapterKind;
  /** Human-readable kind when it aids orientation (intro, poem, bridge, …). */
  kindLabel?: string;
  position: number;
  summary?: string;
  centralQuestion?: string;
  estimatedMinutes?: number;
  /** Reserved for future chapter routes — undefined until routes exist. */
  publicUrl?: string;
  partId?: string;
};

export type BookPartViewModel = {
  id: string;
  title?: string;
  position: number;
  chapters: BookChapterViewModel[];
};

export type BookStructureViewModel = {
  editionId: string;
  workId?: string;
  parts: BookPartViewModel[];
  /** Flat public chapters in reading order (same chapters as in parts). */
  chapters: BookChapterViewModel[];
  totalEstimatedMinutes?: number;
  hasAuthoredSummaries: boolean;
};

const ORIENTING_KINDS = new Set<ManifestChapterKind>([
  "introduction",
  "bridge",
  "conclusion",
  "appendix",
  "interlude",
  "afterword",
  "poem",
  "section",
  "sequence",
]);

const KIND_LABELS: Partial<Record<ManifestChapterKind, string>> = {
  introduction: "Introduction",
  bridge: "Bridge",
  conclusion: "Conclusion",
  appendix: "Appendix",
  interlude: "Interlude",
  afterword: "Afterword",
  poem: "Poem",
  section: "Section",
  sequence: "Sequence",
};

export function chapterKindLabel(kind: ManifestChapterKind): string | undefined {
  if (!ORIENTING_KINDS.has(kind)) return undefined;
  return KIND_LABELS[kind];
}

function toChapterViewModel(chapter: ManifestChapter): BookChapterViewModel {
  return {
    id: chapter.id,
    title: chapter.title,
    kind: chapter.kind,
    kindLabel: chapterKindLabel(chapter.kind),
    position: chapter.position,
    summary: chapter.summary?.trim() || undefined,
    centralQuestion: chapter.centralQuestion?.trim() || undefined,
    estimatedMinutes:
      typeof chapter.estimatedReadingMinutes === "number" && chapter.estimatedReadingMinutes > 0
        ? chapter.estimatedReadingMinutes
        : undefined,
    // Chapter reader routes are not live — do not fabricate links from routeKey.
    publicUrl: undefined,
    partId: chapter.partId,
  };
}

/**
 * Normalize parts + public chapters for a book edition into a presentation view model.
 * Does not embed manuscript text or invent titles/summaries.
 */
export function buildBookStructureViewModel(
  graph: SemanticGraph,
  editionId: string,
): BookStructureViewModel | null {
  const publicChapters = chaptersForEdition(graph, editionId)
    .filter((chapter) => chapter.public)
    .sort((a, b) => a.position - b.position);

  if (publicChapters.length === 0) return null;

  const parts = partsForEdition(graph, editionId).sort((a, b) => a.position - b.position);
  const chapterVms = publicChapters.map(toChapterViewModel);

  const partsWithChapters: BookPartViewModel[] = [];
  const assigned = new Set<string>();

  for (const part of parts) {
    const chapters = chapterVms.filter((c) => c.partId === part.id);
    for (const c of chapters) assigned.add(c.id);
    if (chapters.length === 0) continue;
    partsWithChapters.push({
      id: part.id,
      title: part.title,
      position: part.position,
      chapters,
    });
  }

  const unassigned = chapterVms.filter((c) => !assigned.has(c.id));
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

  const totalEstimatedMinutes = chapterVms.reduce((sum, c) => sum + (c.estimatedMinutes ?? 0), 0);
  const workId = publicChapters[0]?.workId;

  return {
    editionId,
    workId,
    parts: partsWithChapters,
    chapters: chapterVms,
    totalEstimatedMinutes: totalEstimatedMinutes > 0 ? totalEstimatedMinutes : undefined,
    hasAuthoredSummaries: chapterVms.some((c) => Boolean(c.summary)),
  };
}

/** Resolve edition id for a book row (manifest editionId or book id). */
export function editionIdForBook(book: { id: string; editionId?: string }): string {
  return book.editionId ?? book.id;
}

export function buildBookStructureForBook(
  graph: SemanticGraph,
  book: { id: string; editionId?: string },
): BookStructureViewModel | null {
  return buildBookStructureViewModel(graph, editionIdForBook(book));
}

/** Test helper — map raw parts for fixtures. */
export function groupChaptersByPart(
  parts: ManifestPart[],
  chapters: ManifestChapter[],
): BookPartViewModel[] {
  const graph: SemanticGraph = {
    books: [],
    glossary: [],
    patterns: [],
    sources: [],
    relationships: [],
    parts,
    chapters,
  };
  const editionId = chapters[0]?.editionId ?? parts[0]?.editionId ?? "unknown";
  return buildBookStructureViewModel(graph, editionId)?.parts ?? [];
}

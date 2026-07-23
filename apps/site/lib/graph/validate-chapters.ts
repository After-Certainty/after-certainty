import { chapterSlugFromRouteKey, chaptersFromGraph, partsFromGraph } from "@/lib/graph/chapters";
import type { ManifestChapter, ManifestPart, SemanticGraph } from "@/types/semanticGraph";

export type ChapterStructureSeverity = "error" | "warning";

export type ChapterStructureIssue = {
  severity: ChapterStructureSeverity;
  code: string;
  entityId?: string;
  editionId?: string;
  detail: string;
};

/**
 * Structural integrity for schema 2.2 `parts[]` / `chapters[]`.
 * Does not require on-site chapter routes to exist yet.
 */
export function collectChapterStructureHealthIssues(input: {
  graph: SemanticGraph;
  parts?: readonly ManifestPart[];
  chapters?: readonly ManifestChapter[];
}): ChapterStructureIssue[] {
  const { graph } = input;
  const parts = input.parts ?? partsFromGraph(graph);
  const chapters = input.chapters ?? chaptersFromGraph(graph);
  const issues: ChapterStructureIssue[] = [];

  const booksById = new Map(graph.books.map((book) => [book.id, book]));
  const worksById = new Map((graph.works ?? []).map((work) => [work.id, work]));
  const conceptsById = new Map(graph.glossary.map((concept) => [concept.id, concept]));
  const patternsById = new Map(graph.patterns.map((pattern) => [pattern.id, pattern]));
  const situationsById = new Map((graph.situations ?? []).map((s) => [s.id, s]));
  const partsById = new Map(parts.map((part) => [part.id, part]));

  const seenPartIds = new Set<string>();
  const partPositionKeys = new Set<string>();
  for (const part of parts) {
    if (seenPartIds.has(part.id)) {
      issues.push({
        severity: "error",
        code: "duplicate_part_id",
        entityId: part.id,
        editionId: part.editionId,
        detail: `Duplicate part id "${part.id}".`,
      });
    }
    seenPartIds.add(part.id);

    const book = booksById.get(part.editionId);
    if (!book) {
      issues.push({
        severity: "error",
        code: "unknown_part_edition",
        entityId: part.id,
        editionId: part.editionId,
        detail: `Part "${part.id}" references unknown editionId "${part.editionId}".`,
      });
    } else if (book.workId && book.workId !== part.workId) {
      issues.push({
        severity: "error",
        code: "part_work_mismatch",
        entityId: part.id,
        editionId: part.editionId,
        detail: `Part "${part.id}" workId "${part.workId}" does not match book workId "${book.workId}".`,
      });
    }

    if (worksById.size > 0 && !worksById.has(part.workId)) {
      issues.push({
        severity: "warning",
        code: "unknown_part_work",
        entityId: part.id,
        editionId: part.editionId,
        detail: `Part "${part.id}" references unknown workId "${part.workId}".`,
      });
    }

    const posKey = `${part.editionId}::${part.position}`;
    if (partPositionKeys.has(posKey)) {
      issues.push({
        severity: "error",
        code: "duplicate_part_position",
        entityId: part.id,
        editionId: part.editionId,
        detail: `Duplicate part position ${part.position} on edition "${part.editionId}".`,
      });
    }
    partPositionKeys.add(posKey);
  }

  const seenChapterIds = new Set<string>();
  const seenRouteKeys = new Set<string>();
  const chapterPositionKeys = new Set<string>();

  for (const chapter of chapters) {
    if (seenChapterIds.has(chapter.id)) {
      issues.push({
        severity: "error",
        code: "duplicate_chapter_id",
        entityId: chapter.id,
        editionId: chapter.editionId,
        detail: `Duplicate chapter id "${chapter.id}".`,
      });
    }
    seenChapterIds.add(chapter.id);

    if (seenRouteKeys.has(chapter.routeKey)) {
      issues.push({
        severity: "error",
        code: "duplicate_chapter_route",
        entityId: chapter.id,
        editionId: chapter.editionId,
        detail: `Duplicate chapter routeKey "${chapter.routeKey}".`,
      });
    }
    seenRouteKeys.add(chapter.routeKey);

    const slug = chapterSlugFromRouteKey(chapter.routeKey);
    if (!slug.trim()) {
      issues.push({
        severity: "error",
        code: "invalid_chapter_route",
        entityId: chapter.id,
        editionId: chapter.editionId,
        detail: `Chapter "${chapter.id}" has an unusable routeKey "${chapter.routeKey}".`,
      });
    }

    const book = booksById.get(chapter.editionId);
    if (!book) {
      issues.push({
        severity: "error",
        code: "unknown_chapter_edition",
        entityId: chapter.id,
        editionId: chapter.editionId,
        detail: `Chapter "${chapter.id}" references unknown editionId "${chapter.editionId}".`,
      });
    } else if (book.workId && book.workId !== chapter.workId) {
      issues.push({
        severity: "error",
        code: "chapter_work_mismatch",
        entityId: chapter.id,
        editionId: chapter.editionId,
        detail: `Chapter "${chapter.id}" workId "${chapter.workId}" does not match book workId "${book.workId}".`,
      });
    }

    if (worksById.size > 0 && !worksById.has(chapter.workId)) {
      issues.push({
        severity: "warning",
        code: "unknown_chapter_work",
        entityId: chapter.id,
        editionId: chapter.editionId,
        detail: `Chapter "${chapter.id}" references unknown workId "${chapter.workId}".`,
      });
    }

    const posKey = `${chapter.editionId}::${chapter.position}`;
    if (chapterPositionKeys.has(posKey)) {
      issues.push({
        severity: "error",
        code: "duplicate_chapter_position",
        entityId: chapter.id,
        editionId: chapter.editionId,
        detail: `Duplicate chapter position ${chapter.position} on edition "${chapter.editionId}".`,
      });
    }
    chapterPositionKeys.add(posKey);

    if (chapter.partId) {
      const part = partsById.get(chapter.partId);
      if (!part) {
        issues.push({
          severity: "error",
          code: "unknown_chapter_part",
          entityId: chapter.id,
          editionId: chapter.editionId,
          detail: `Chapter "${chapter.id}" references unknown partId "${chapter.partId}".`,
        });
      } else if (part.editionId !== chapter.editionId) {
        issues.push({
          severity: "error",
          code: "chapter_part_edition_mismatch",
          entityId: chapter.id,
          editionId: chapter.editionId,
          detail: `Chapter "${chapter.id}" part "${chapter.partId}" belongs to edition "${part.editionId}".`,
        });
      }
    }

    for (const conceptId of chapter.selectedConceptIds ?? []) {
      if (!conceptsById.has(conceptId)) {
        issues.push({
          severity: "error",
          code: "unknown_chapter_concept",
          entityId: chapter.id,
          editionId: chapter.editionId,
          detail: `Chapter "${chapter.id}" references unknown concept "${conceptId}".`,
        });
      }
    }
    for (const patternId of chapter.selectedPatternIds ?? []) {
      if (!patternsById.has(patternId)) {
        issues.push({
          severity: "error",
          code: "unknown_chapter_pattern",
          entityId: chapter.id,
          editionId: chapter.editionId,
          detail: `Chapter "${chapter.id}" references unknown pattern "${patternId}".`,
        });
      }
    }
    for (const situationId of chapter.situationIds ?? []) {
      if (!situationsById.has(situationId)) {
        issues.push({
          severity: "error",
          code: "unknown_chapter_situation",
          entityId: chapter.id,
          editionId: chapter.editionId,
          detail: `Chapter "${chapter.id}" references unknown situation "${situationId}".`,
        });
      }
    }
  }

  return issues;
}

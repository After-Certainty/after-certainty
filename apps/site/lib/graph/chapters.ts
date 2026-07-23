import type { ManifestChapter, ManifestPart, SemanticGraph } from "@/types/semanticGraph";

/** Last path segment of a chapter `routeKey` (stable public slug once routes ship). */
export function chapterSlugFromRouteKey(routeKey: string): string {
  const trimmed = routeKey.replace(/\/+$/, "");
  const segment = trimmed.split("/").filter(Boolean).pop();
  return segment && segment.length > 0 ? segment : routeKey;
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

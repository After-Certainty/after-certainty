/**
 * Provider-neutral chapter-audio alignment parsing (site-facing).
 * Browser-safe: no Node builtins — shared by client player and server page.
 */

import type { ChapterAudioAlignmentGranularity } from "@/lib/reading/chapter-audio";

export type ChapterAudioAlignmentSegment = {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  charStart?: number;
  charEnd?: number;
};

export type ChapterAudioAlignment = {
  schemaVersion: 1;
  unitId: string;
  generationHash: string;
  granularity: ChapterAudioAlignmentGranularity;
  segments: ChapterAudioAlignmentSegment[];
};

const GRANULARITIES = new Set<ChapterAudioAlignmentGranularity>([
  "native-character",
  "native-word",
  "derived-word",
  "segment-only",
  "none",
]);

/** Granularities that can drive sentence-level DOM highlighting. */
export function canHighlightAlignment(
  granularity: ChapterAudioAlignmentGranularity | null | undefined,
): boolean {
  return granularity === "segment-only";
}

export function parseChapterAudioAlignment(raw: unknown): ChapterAudioAlignment | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  if (a.schemaVersion !== 1) return null;
  if (typeof a.unitId !== "string" || !a.unitId) return null;
  if (typeof a.generationHash !== "string" || !a.generationHash) return null;
  if (
    typeof a.granularity !== "string" ||
    !GRANULARITIES.has(a.granularity as ChapterAudioAlignmentGranularity)
  ) {
    return null;
  }
  if (!Array.isArray(a.segments)) return null;
  const segments: ChapterAudioAlignmentSegment[] = [];
  for (const item of a.segments) {
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    if (typeof s.id !== "string" || !s.id) continue;
    if (typeof s.text !== "string") continue;
    if (typeof s.startMs !== "number" || typeof s.endMs !== "number") continue;
    if (s.endMs < s.startMs) continue;
    const seg: ChapterAudioAlignmentSegment = {
      id: s.id,
      text: s.text,
      startMs: s.startMs,
      endMs: s.endMs,
    };
    if (typeof s.charStart === "number") seg.charStart = s.charStart;
    if (typeof s.charEnd === "number") seg.charEnd = s.charEnd;
    segments.push(seg);
  }
  return {
    schemaVersion: 1,
    unitId: a.unitId,
    generationHash: a.generationHash,
    granularity: a.granularity as ChapterAudioAlignmentGranularity,
    segments,
  };
}

/** Active segment for a playback position in milliseconds. */
export function findActiveAlignmentSegment(
  segments: readonly ChapterAudioAlignmentSegment[],
  timeMs: number,
): ChapterAudioAlignmentSegment | null {
  if (!segments.length || timeMs < 0) return null;
  for (const seg of segments) {
    if (timeMs >= seg.startMs && timeMs < seg.endMs) return seg;
  }
  const last = segments[segments.length - 1];
  if (timeMs >= last.startMs && timeMs <= last.endMs) return last;
  return null;
}

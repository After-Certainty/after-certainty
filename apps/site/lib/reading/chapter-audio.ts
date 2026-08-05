/**
 * Chapter TTS (available units only). Listen appears iff a unit is present
 * in the installed local audio manifest — no feature-flag env var.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const LOCAL_CHAPTER_AUDIO_MANIFEST_RELATIVE = "data/local-chapter-audio-manifest.json";

export type ChapterAudioAlignmentGranularity =
  | "native-character"
  | "native-word"
  | "derived-word"
  | "segment-only"
  | "none";

export type ChapterAudioUnit = {
  unitId: string;
  editionSlug: string;
  /** Repo-relative book directory; present on newly built manifests. */
  bookRelpath?: string;
  chapterSlug: string;
  routeKey: string;
  audioUrl: string;
  durationSeconds: number | null;
  alignmentUrl: string | null;
  alignmentGranularity: ChapterAudioAlignmentGranularity;
  generationHash: string;
  disclosure: string;
};

export type ChapterAudioManifest = {
  schemaVersion: 1;
  generatedAt: string;
  units: ChapterAudioUnit[];
};

const GRANULARITIES = new Set<ChapterAudioAlignmentGranularity>([
  "native-character",
  "native-word",
  "derived-word",
  "segment-only",
  "none",
]);

function isUnit(value: unknown): value is ChapterAudioUnit {
  if (!value || typeof value !== "object") return false;
  const u = value as Record<string, unknown>;
  return (
    typeof u.unitId === "string" &&
    typeof u.editionSlug === "string" &&
    typeof u.chapterSlug === "string" &&
    typeof u.routeKey === "string" &&
    typeof u.audioUrl === "string" &&
    (u.durationSeconds === null || typeof u.durationSeconds === "number") &&
    (u.alignmentUrl === null || typeof u.alignmentUrl === "string") &&
    typeof u.alignmentGranularity === "string" &&
    GRANULARITIES.has(u.alignmentGranularity as ChapterAudioAlignmentGranularity) &&
    typeof u.generationHash === "string" &&
    typeof u.disclosure === "string"
  );
}

export function parseChapterAudioManifest(raw: unknown): ChapterAudioManifest | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  if (m.schemaVersion !== 1) return null;
  if (typeof m.generatedAt !== "string") return null;
  if (!Array.isArray(m.units)) return null;
  const units = m.units.filter(isUnit);
  return {
    schemaVersion: 1,
    generatedAt: m.generatedAt,
    units,
  };
}

export function loadChapterAudioManifest(
  rootDir: string = process.cwd(),
): ChapterAudioManifest | null {
  const path = join(rootDir, LOCAL_CHAPTER_AUDIO_MANIFEST_RELATIVE);
  if (!existsSync(path)) return null;
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
    return parseChapterAudioManifest(raw);
  } catch {
    return null;
  }
}

/** Look up available narration for one public chapter; null when not installed. */
export function getChapterAudioForChapter(args: {
  editionSlug: string;
  chapterSlug: string;
  chapterId?: string;
  rootDir?: string;
}): ChapterAudioUnit | null {
  const manifest = loadChapterAudioManifest(args.rootDir);
  if (!manifest) return null;
  return (
    manifest.units.find(
      (u) =>
        u.editionSlug === args.editionSlug &&
        (u.chapterSlug === args.chapterSlug ||
          (args.chapterId != null && u.unitId === args.chapterId)),
    ) ?? null
  );
}

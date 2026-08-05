/**
 * Server-only: load installed chapter-audio alignment from disk.
 * Do not import from client components (uses node:fs).
 *
 * Alignments live under apps/site/data/chapter-audio/ (installed at build time).
 * MP3s stay under public/generated/audio/ for CDN serving and must not be read
 * via fs here — that would file-trace binaries into the serverless function.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { ChapterAudioUnit } from "@/lib/reading/chapter-audio";
import {
  canHighlightAlignment,
  parseChapterAudioAlignment,
  type ChapterAudioAlignment,
} from "@/lib/reading/chapter-audio-alignment";

/** Installed SSR alignment root (relative to apps/site). */
export const CHAPTER_AUDIO_DATA_RELATIVE = "data/chapter-audio";

/**
 * Load alignment JSON for an available unit from the installed data tree.
 * Returns null when missing/unusable.
 */
export function loadChapterAudioAlignment(
  unit: ChapterAudioUnit,
  rootDir: string = process.cwd(),
): ChapterAudioAlignment | null {
  if (!canHighlightAlignment(unit.alignmentGranularity)) return null;
  const edition = unit.editionSlug?.trim();
  const chapter = unit.chapterSlug?.trim();
  if (!edition || !chapter || edition.includes("..") || chapter.includes("..")) {
    return null;
  }
  if (edition.includes("/") || chapter.includes("/")) return null;

  const path = join(rootDir, CHAPTER_AUDIO_DATA_RELATIVE, edition, `${chapter}.alignment.json`);
  if (!existsSync(path)) return null;
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
    const parsed = parseChapterAudioAlignment(raw);
    if (!parsed) return null;
    if (parsed.generationHash !== unit.generationHash) return null;
    return parsed;
  } catch {
    return null;
  }
}

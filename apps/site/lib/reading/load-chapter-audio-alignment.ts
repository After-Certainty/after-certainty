/**
 * Server-only: load installed chapter-audio alignment from disk.
 * Do not import from client components (uses node:fs).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { ChapterAudioUnit } from "@/lib/reading/chapter-audio";
import {
  canHighlightAlignment,
  parseChapterAudioAlignment,
  type ChapterAudioAlignment,
} from "@/lib/reading/chapter-audio-alignment";

/**
 * Load alignment JSON for an available unit from the installed public tree
 * (apps/site/public + alignmentUrl). Returns null when missing/unusable.
 */
export function loadChapterAudioAlignment(
  unit: ChapterAudioUnit,
  rootDir: string = process.cwd(),
): ChapterAudioAlignment | null {
  if (!canHighlightAlignment(unit.alignmentGranularity)) return null;
  const url = unit.alignmentUrl?.trim();
  if (!url || !url.startsWith("/")) return null;
  const rel = url.replace(/^\/+/, "");
  if (!rel || rel.includes("..")) return null;
  const path = join(rootDir, "public", rel);
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

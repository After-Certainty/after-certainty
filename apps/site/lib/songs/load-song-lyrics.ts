import fs from "node:fs/promises";
import path from "node:path";

import { resolveMonorepoRoot } from "@/lib/reading/repo-root";

const FRONT_MATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/**
 * Strip YAML front matter from a lyrics markdown file body.
 */
export function stripLyricsFrontMatter(markdown: string): string {
  return markdown.replace(FRONT_MATTER_RE, "").trimStart();
}

/**
 * Load song lyrics from the monorepo via a repo-relative `lyricsPath`
 * (typically `corpus/songs/<slug>.md`). Returns null when missing or unreadable.
 */
export async function loadSongLyrics(
  lyricsPath: string,
  startDir: string = process.cwd(),
): Promise<string | null> {
  const trimmed = lyricsPath.trim();
  if (!trimmed || trimmed.includes("..") || path.isAbsolute(trimmed)) {
    return null;
  }
  const root = resolveMonorepoRoot(startDir);
  const absolute = path.join(root, trimmed);
  try {
    const raw = await fs.readFile(absolute, "utf8");
    return stripLyricsFrontMatter(raw);
  } catch {
    return null;
  }
}

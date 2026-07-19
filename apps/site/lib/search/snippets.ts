import { prepareSearchQuery } from "@/lib/search/prepareQuery";
import type { SearchDocument } from "@/lib/search/types";

export type SearchSnippetHighlight = {
  start: number;
  end: number;
};

export type SearchSnippet = {
  text: string;
  highlights: SearchSnippetHighlight[];
};

function collectCandidateTexts(document: SearchDocument): string[] {
  const candidates: string[] = [];
  if (document.description?.trim()) candidates.push(document.description.trim());
  if (document.subtitle?.trim()) candidates.push(document.subtitle.trim());

  // Prefer human-facing prose lines from searchText (skip title/slug echoes).
  const title = document.title.trim().toLowerCase();
  const slug = document.slug.trim().toLowerCase();
  for (const line of document.searchText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (lower === title || lower === slug) continue;
    if (trimmed.length < 24) continue;
    if (candidates.some((c) => c.toLowerCase() === lower)) continue;
    candidates.push(trimmed);
    if (candidates.length >= 6) break;
  }

  return candidates;
}

function findBestWindow(text: string, tokens: readonly string[], maxLen: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLen) return normalized;

  const lower = normalized.toLowerCase();
  let bestIndex = 0;
  for (const token of tokens) {
    const idx = lower.indexOf(token);
    if (idx >= 0) {
      bestIndex = Math.max(0, idx - Math.floor(maxLen * 0.25));
      break;
    }
  }

  let slice = normalized.slice(bestIndex, bestIndex + maxLen);
  if (bestIndex > 0) {
    const space = slice.indexOf(" ");
    if (space > 0 && space < 24) slice = slice.slice(space + 1);
    slice = `…${slice.trimStart()}`;
  }
  if (bestIndex + maxLen < normalized.length) {
    const lastSpace = slice.lastIndexOf(" ");
    if (lastSpace > Math.floor(maxLen * 0.6)) slice = slice.slice(0, lastSpace);
    slice = `${slice.trimEnd()}…`;
  }
  return slice;
}

/** Inclusive highlight ranges for significant query tokens (case-insensitive). */
export function highlightRangesForQuery(text: string, query: string): SearchSnippetHighlight[] {
  const { tokens } = prepareSearchQuery(query);
  if (!text || tokens.length === 0) return [];

  const lower = text.toLowerCase();
  const ranges: SearchSnippetHighlight[] = [];

  for (const token of tokens) {
    if (token.length < 2) continue;
    let from = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(token, from);
      if (idx < 0) break;
      ranges.push({ start: idx, end: idx + token.length });
      from = idx + token.length;
    }
  }

  if (ranges.length === 0) return [];

  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: SearchSnippetHighlight[] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

/**
 * Query-aware snippet for result rows. Pure text + ranges — render with React
 * children (never `dangerouslySetInnerHTML`).
 */
export function buildSearchSnippet(
  query: string,
  document: SearchDocument,
  maxLen = 180,
): SearchSnippet | null {
  const prepared = prepareSearchQuery(query);
  const candidates = collectCandidateTexts(document);
  if (candidates.length === 0) return null;

  let best = candidates[0]!;
  let bestScore = -1;

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    let score = 0;
    for (const token of prepared.tokens) {
      if (lower.includes(token)) score += 3 + Math.min(token.length, 12);
    }
    // Prefer description over later searchText lines when scores tie.
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  const text = findBestWindow(best, prepared.tokens, maxLen);
  return {
    text,
    highlights: highlightRangesForQuery(text, query),
  };
}

/** Split snippet text into plain / highlighted segments for safe React rendering. */
export function snippetSegments(
  snippet: SearchSnippet,
): Array<{ text: string; highlight: boolean }> {
  const { text, highlights } = snippet;
  if (!highlights.length) return [{ text, highlight: false }];

  const segments: Array<{ text: string; highlight: boolean }> = [];
  let cursor = 0;
  for (const range of highlights) {
    if (range.start > cursor) {
      segments.push({ text: text.slice(cursor, range.start), highlight: false });
    }
    segments.push({ text: text.slice(range.start, range.end), highlight: true });
    cursor = range.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlight: false });
  }
  return segments.filter((s) => s.text.length > 0);
}

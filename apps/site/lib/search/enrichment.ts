import { uniqueStrings } from "@/lib/search/text";

/** Soft cap so enrichment helps thematic match without bloating the client index. */
export const SEARCH_ENRICHMENT_MAX_CHARS = 420;

/**
 * Join recognition / signal phrases into a capped blob for searchText.
 * Prefer shorter early signals; stop once the character budget is reached.
 */
export function cappedEnrichmentText(
  signals: readonly string[] | undefined,
  maxChars: number = SEARCH_ENRICHMENT_MAX_CHARS,
): string | undefined {
  if (!signals?.length || maxChars <= 0) return undefined;

  const parts = uniqueStrings(signals);
  const out: string[] = [];
  let used = 0;

  for (const part of parts) {
    const next = used === 0 ? part.length : used + 1 + part.length;
    if (next > maxChars) {
      if (out.length === 0) {
        out.push(part.slice(0, maxChars).trimEnd());
      }
      break;
    }
    out.push(part);
    used = next;
  }

  const joined = out.join("\n").trim();
  return joined || undefined;
}

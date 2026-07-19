import searchAliasesJson from "@/data/search-aliases.json";
import type { SearchAliasConfig, SearchAliasEntry, SearchAliasKind } from "@/lib/search/types";

function isAliasKind(value: unknown): value is SearchAliasKind {
  return value === "alias" || value === "related";
}

function normalizeEntry(raw: unknown): SearchAliasEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (!isAliasKind(record.kind)) return null;
  if (!Array.isArray(record.terms) || !Array.isArray(record.targetIds)) return null;

  const terms = record.terms
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean);
  const targetIds = record.targetIds
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean);

  if (terms.length === 0 || targetIds.length === 0) return null;

  const note =
    typeof record.note === "string" && record.note.trim().length > 0
      ? record.note.trim()
      : undefined;

  return { terms, kind: record.kind, targetIds, note };
}

/** Validate and normalize an alias config object (from JSON or tests). */
export function parseSearchAliasConfig(data: unknown): SearchAliasConfig {
  if (!data || typeof data !== "object") {
    return { version: 1, entries: [] };
  }
  const record = data as Record<string, unknown>;
  const version =
    typeof record.version === "number" && Number.isFinite(record.version) ? record.version : 1;
  const rawEntries = Array.isArray(record.entries) ? record.entries : [];
  const entries = rawEntries.map(normalizeEntry).filter((e): e is SearchAliasEntry => e !== null);
  return { version, entries };
}

/** Bundled authored vocabulary bridge (`data/search-aliases.json`). */
export function getSearchAliasConfig(): SearchAliasConfig {
  return parseSearchAliasConfig(searchAliasesJson);
}

/**
 * Map target entity id → alias terms that should be indexed on that document.
 * Only `kind: "alias"` terms are attached to documents; `related` is for ranking/UI later.
 */
export function aliasTermsByTargetId(config: SearchAliasConfig): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const entry of config.entries) {
    if (entry.kind !== "alias") continue;
    for (const targetId of entry.targetIds) {
      const existing = map.get(targetId) ?? [];
      for (const term of entry.terms) {
        if (!existing.some((t) => t.toLowerCase() === term.toLowerCase())) {
          existing.push(term);
        }
      }
      map.set(targetId, existing);
    }
  }
  return map;
}

/** Related (non-equivalent) bridge terms keyed by target id — not silent synonyms. */
export function relatedTermsByTargetId(config: SearchAliasConfig): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const entry of config.entries) {
    if (entry.kind !== "related") continue;
    for (const targetId of entry.targetIds) {
      const existing = map.get(targetId) ?? [];
      for (const term of entry.terms) {
        if (!existing.some((t) => t.toLowerCase() === term.toLowerCase())) {
          existing.push(term);
        }
      }
      map.set(targetId, existing);
    }
  }
  return map;
}

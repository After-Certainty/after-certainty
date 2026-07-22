import fallbackSemantic from "@/data/semantic-manifest.json";
import type { SearchAliasConfig, SearchAliasEntry, SearchAliasKind } from "@/lib/search/types";
import type { SemanticGraph } from "@/types/semanticGraph";

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

export function getSearchAliasConfigFromGraph(graph: SemanticGraph): SearchAliasConfig {
  return parseSearchAliasConfig({
    version: 1,
    entries: graph.searchAliases ?? [],
  });
}

/**
 * Sync accessor for bundled `searchAliases`.
 * Intentionally avoids `@/lib/graph/manifest` so this module stays safe for client components
 * (e.g. search query ranking imports `relatedTermsByTargetId` from here).
 */
export function getSearchAliasConfig(): SearchAliasConfig {
  const record = fallbackSemantic as { searchAliases?: unknown };
  return parseSearchAliasConfig({
    version: 1,
    entries: Array.isArray(record.searchAliases) ? record.searchAliases : [],
  });
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

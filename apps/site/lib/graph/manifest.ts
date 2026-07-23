import { cache } from "react";
import { revalidateTag } from "next/cache";
import fallbackSemantic from "@/data/semantic-manifest.json";
import { outboundFetchSignal } from "@/lib/security/fetch";
import { isSemanticManifestOffline, resolveSemanticManifestUrl } from "@/lib/site-config";
import type { Book, SemanticGraph } from "@/types/semanticGraph";
import { validateSemanticGraph } from "@/lib/graph/validate";
import {
  INTENDED_SCHEMA_VERSION,
  SUPPORTED_SCHEMA_MAJOR,
  isCompatibleSchemaVersion,
  isIntendedSchemaVersion,
} from "@/lib/graph/schema-version";
import {
  buildManifestLockFromLoadResult,
  writeManifestBuildLock,
} from "@/lib/graph/build-manifest-lock";

export { validateSemanticGraph, type ValidateSemanticGraphResult } from "@/lib/graph/validate";
export {
  INTENDED_SCHEMA_VERSION,
  SUPPORTED_SCHEMA_MAJOR,
  compareSchemaVersions,
  isCompatibleSchemaVersion,
  isCompatibilitySchemaVersion,
  isIntendedSchemaVersion,
  isSchemaAtLeast,
  parseSchemaVersion,
} from "@/lib/graph/schema-version";
export {
  buildManifestLockFromLoadResult,
  writeManifestBuildLock,
  releaseIdentityKey,
  type ManifestBuildLock,
  MANIFEST_BUILD_LOCK_RELATIVE_PATH,
} from "@/lib/graph/build-manifest-lock";

/** Next.js fetch / `revalidateTag` cache tag for on-demand graph refresh. */
export const SEMANTIC_GRAPH_CACHE_TAG = "semantic-graph";

/** Default fallback staleness threshold (days). Override with SEMANTIC_MANIFEST_FALLBACK_STALE_DAYS. */
export const DEFAULT_FALLBACK_STALE_DAYS = 30;

export type ManifestFailureCategory =
  | "offline"
  | "network"
  | "http"
  | "invalid_json"
  | "validation"
  | "incompatible_schema"
  | "empty_remote"
  | "invalid_fallback"
  | "incompatible_fallback";

export type ManifestReleaseIdentity = {
  schemaVersion?: string;
  sourceCommit?: string;
  generatedAt?: string;
  contentVersion?: string;
};

export type ManifestSource = {
  kind: "remote" | "fallback";
  schemaVersion?: string;
  sourceCommit?: string;
  generatedAt?: string;
  contentVersion?: string;
  stale: boolean;
  /** Stable cache / diagnostics identity for this load. */
  cacheIdentity: string;
  ageDays?: number;
  reason?: ManifestFailureCategory;
};

export type ManifestLoadDiagnostic = {
  category: ManifestFailureCategory | "ok";
  message: string;
  details?: Record<string, string | number | boolean | undefined>;
};

export type SemanticGraphLoadResult = {
  graph: SemanticGraph;
  source: ManifestSource;
  diagnostics: ManifestLoadDiagnostic[];
};

export const SEMANTIC_MANIFEST_REVALIDATE_SECONDS = (() => {
  const raw = process.env.SEMANTIC_MANIFEST_REVALIDATE_SECONDS?.trim();
  if (!raw) return 3600;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 3600;
})();

const EMPTY_GRAPH: SemanticGraph = {
  books: [],
  glossary: [],
  patterns: [],
  situations: [],
  sources: [],
  relationships: [],
};

function logSemanticGraphError(message: string, err?: unknown): void {
  if (err !== undefined) {
    console.error(`[semantic-graph] ${message}`, err);
  } else {
    console.error(`[semantic-graph] ${message}`);
  }
}

function logManifestLoadOnce(result: SemanticGraphLoadResult): void {
  const { source, diagnostics } = result;
  const payload = {
    kind: source.kind,
    schemaVersion: source.schemaVersion,
    sourceCommit: source.sourceCommit,
    generatedAt: source.generatedAt,
    contentVersion: source.contentVersion,
    cacheIdentity: source.cacheIdentity,
    stale: source.stale,
    ageDays: source.ageDays,
    reason: source.reason,
    diagnosticCount: diagnostics.length,
    categories: diagnostics.map((d) => d.category),
  };
  if (source.kind === "remote" && diagnostics.every((d) => d.category === "ok")) {
    return;
  }
  console.error("[semantic-graph] Manifest load", payload);
}

/** Persist a small build lock once per Node process (build / long-lived server). */
let buildLockWritten = false;

function maybeWriteBuildLock(result: SemanticGraphLoadResult): void {
  if (buildLockWritten) return;
  if (
    process.env.NEXT_PHASE !== "phase-production-build" &&
    process.env.WRITE_MANIFEST_BUILD_LOCK !== "1"
  ) {
    return;
  }
  try {
    const lock = buildManifestLockFromLoadResult(result);
    writeManifestBuildLock(lock);
    buildLockWritten = true;
    console.info("[semantic-graph] Wrote build manifest lock", {
      schemaVersion: lock.schemaVersion,
      sourceCommit: lock.sourceCommit,
      manifestSource: lock.manifestSource,
      cacheIdentity: lock.cacheIdentity,
    });
  } catch (err) {
    logSemanticGraphError("Failed to write build manifest lock.", err);
  }
}

export function fallbackStaleDaysThreshold(): number {
  const raw = process.env.SEMANTIC_MANIFEST_FALLBACK_STALE_DAYS?.trim();
  if (!raw) return DEFAULT_FALLBACK_STALE_DAYS;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_FALLBACK_STALE_DAYS;
}

export function parseGeneratedAtMs(generatedAt: string | undefined): number | undefined {
  if (!generatedAt?.trim()) return undefined;
  const parsed = Date.parse(generatedAt);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function fallbackAgeDays(
  generatedAt: string | undefined,
  nowMs: number = Date.now(),
): number | undefined {
  const parsed = parseGeneratedAtMs(generatedAt);
  if (parsed === undefined) return undefined;
  const ageMs = Math.max(0, nowMs - parsed);
  return Math.floor(ageMs / (24 * 60 * 60 * 1000));
}

export function isFallbackStale(
  generatedAt: string | undefined,
  options?: { nowMs?: number; thresholdDays?: number },
): { stale: boolean; ageDays?: number } {
  const ageDays = fallbackAgeDays(generatedAt, options?.nowMs);
  const threshold = options?.thresholdDays ?? fallbackStaleDaysThreshold();
  if (ageDays === undefined) {
    return { stale: true, ageDays: undefined };
  }
  return { stale: ageDays > threshold, ageDays };
}

/**
 * Build a stable cache identity from release provenance so routes share one corpus version.
 */
export function buildManifestCacheIdentity(
  identity: ManifestReleaseIdentity,
  options?: { url?: string; kind?: "remote" | "fallback" },
): string {
  const parts = [
    options?.kind ?? "unknown",
    options?.url ?? resolveSemanticManifestUrl(),
    identity.schemaVersion ?? "unknown-schema",
    identity.sourceCommit ?? "unknown-commit",
    identity.contentVersion ?? "no-content-version",
    identity.generatedAt ?? "unknown-generated-at",
  ];
  return parts.join("|");
}

export function releaseIdentityFromGraph(graph: SemanticGraph): ManifestReleaseIdentity {
  return {
    schemaVersion: graph.schemaVersion,
    sourceCommit: graph.sourceCommit,
    generatedAt: graph.generatedAt,
    contentVersion: graph.contentVersion,
  };
}

function provenanceFromGraph(graph: SemanticGraph): ManifestReleaseIdentity {
  return releaseIdentityFromGraph(graph);
}

function buildFallbackSource(
  graph: SemanticGraph,
  reason: ManifestFailureCategory,
): ManifestSource {
  const provenance = provenanceFromGraph(graph);
  const { stale, ageDays } = isFallbackStale(provenance.generatedAt);
  return {
    kind: "fallback",
    ...provenance,
    stale,
    ageDays,
    reason,
    cacheIdentity: buildManifestCacheIdentity(provenance, { kind: "fallback" }),
  };
}

function buildRemoteSource(graph: SemanticGraph): ManifestSource {
  const provenance = provenanceFromGraph(graph);
  return {
    kind: "remote",
    ...provenance,
    stale: false,
    cacheIdentity: buildManifestCacheIdentity(provenance, {
      kind: "remote",
      url: resolveSemanticManifestUrl(),
    }),
  };
}

function semanticBookExportScore(book: Book): number {
  let score = 0;
  for (const block of [book.docx, book.epub, book.pdf]) {
    if (block?.enabled && block.url) score += 1;
  }
  return score;
}

/** When release JSON lists duplicate slugs, keep the row with live export URLs (published under books/). */
export function dedupeSemanticGraphBooks(books: Book[]): Book[] {
  const bySlug = new Map<string, Book>();
  for (const book of books) {
    const existing = bySlug.get(book.slug);
    if (!existing) {
      bySlug.set(book.slug, book);
      continue;
    }
    if (semanticBookExportScore(book) > semanticBookExportScore(existing)) {
      bySlug.set(book.slug, book);
    }
  }
  return [...bySlug.values()];
}

function withDedupedBooks(graph: SemanticGraph): SemanticGraph {
  return { ...graph, books: dedupeSemanticGraphBooks(graph.books) };
}

type BundledLoad =
  | { ok: true; graph: SemanticGraph }
  | { ok: false; graph: SemanticGraph; category: ManifestFailureCategory; message: string };

function loadBundledFallbackGraph(): BundledLoad {
  const validated = validateSemanticGraph(fallbackSemantic as unknown);
  if (!validated.success) {
    logSemanticGraphError(
      "Bundled semantic-manifest.json failed validation; using hard empty graph.",
      validated.error,
    );
    return {
      ok: false,
      graph: EMPTY_GRAPH,
      category: "invalid_fallback",
      message: "Bundled semantic-manifest.json failed validation.",
    };
  }

  if (!isCompatibleSchemaVersion(validated.data.schemaVersion)) {
    logSemanticGraphError(
      `Bundled semantic-manifest.json has incompatible schemaVersion ${validated.data.schemaVersion}.`,
    );
    return {
      ok: false,
      graph: EMPTY_GRAPH,
      category: "incompatible_fallback",
      message: `Bundled schemaVersion ${validated.data.schemaVersion} is incompatible.`,
    };
  }

  return { ok: true, graph: withDedupedBooks(validated.data) };
}

function fallbackResult(
  reason: ManifestFailureCategory,
  message: string,
  extra?: ManifestLoadDiagnostic[],
): SemanticGraphLoadResult {
  const bundled = loadBundledFallbackGraph();
  const diagnostics: ManifestLoadDiagnostic[] = [...(extra ?? []), { category: reason, message }];

  if (!bundled.ok) {
    diagnostics.push({ category: bundled.category, message: bundled.message });
    const source = buildFallbackSource(bundled.graph, bundled.category);
    return { graph: bundled.graph, source, diagnostics };
  }

  const source = buildFallbackSource(bundled.graph, reason);
  if (source.stale) {
    diagnostics.push({
      category: reason,
      message: `Fallback manifest is stale (ageDays=${source.ageDays ?? "unknown"}, threshold=${fallbackStaleDaysThreshold()}).`,
      details: { ageDays: source.ageDays, stale: true },
    });
  }

  return { graph: bundled.graph, source, diagnostics };
}

/**
 * Remote-first selection: prefer a valid remote graph; fall back only when remote is
 * unusable (empty books). Prefer this over richness-based picking.
 */
export function selectRemoteOrFallback(
  remote: SemanticGraph,
  bundled: SemanticGraph,
): { graph: SemanticGraph; usedFallback: boolean; reason?: ManifestFailureCategory } {
  if (remote.books.length === 0 && bundled.books.length > 0) {
    return { graph: withDedupedBooks(bundled), usedFallback: true, reason: "empty_remote" };
  }
  return { graph: withDedupedBooks(remote), usedFallback: false };
}

/**
 * @deprecated Use {@link selectRemoteOrFallback}. Kept for older tests; remote-first
 * with empty-books safety only (no richness preference).
 */
export function pickSemanticGraph(remote: SemanticGraph, bundled: SemanticGraph): SemanticGraph {
  return selectRemoteOrFallback(remote, bundled).graph;
}

/**
 * Fetch semantic graph (ISR) or return bundled JSON when offline / on failure.
 * Returns graph + provenance. Prefer {@link getSemanticGraphLoadResult} in new code.
 */
export async function fetchSemanticGraphLoadResultUncached(): Promise<SemanticGraphLoadResult> {
  if (isSemanticManifestOffline()) {
    const result = fallbackResult(
      "offline",
      "SEMANTIC_MANIFEST_OFFLINE=1; using bundled fallback.",
    );
    logManifestLoadOnce(result);
    return result;
  }

  const url = resolveSemanticManifestUrl();

  try {
    const res = await fetch(url, {
      next: {
        revalidate: SEMANTIC_MANIFEST_REVALIDATE_SECONDS,
        tags: [SEMANTIC_GRAPH_CACHE_TAG, `semantic-schema:${INTENDED_SCHEMA_VERSION}`],
      },
      headers: { Accept: "application/json, */*" },
      signal: outboundFetchSignal(),
    });

    if (!res.ok) {
      const result = fallbackResult("http", `Remote semantic manifest HTTP ${res.status}.`);
      logManifestLoadOnce(result);
      return result;
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch (err) {
      const result = fallbackResult(
        "invalid_json",
        "Remote semantic manifest was not valid JSON.",
        [
          {
            category: "invalid_json",
            message: err instanceof Error ? err.message : "JSON parse failed",
          },
        ],
      );
      logManifestLoadOnce(result);
      return result;
    }

    const validated = validateSemanticGraph(data);
    if (!validated.success) {
      const result = fallbackResult(
        "validation",
        "Remote semantic manifest failed Zod validation.",
      );
      logSemanticGraphError("Remote semantic manifest validation failed.", validated.error);
      logManifestLoadOnce(result);
      return result;
    }

    if (!isCompatibleSchemaVersion(validated.data.schemaVersion)) {
      const result = fallbackResult(
        "incompatible_schema",
        `Remote schemaVersion ${validated.data.schemaVersion} is incompatible (supported major <= ${SUPPORTED_SCHEMA_MAJOR}).`,
      );
      logManifestLoadOnce(result);
      return result;
    }

    const bundled = loadBundledFallbackGraph();
    const selection = selectRemoteOrFallback(
      validated.data,
      bundled.ok ? bundled.graph : EMPTY_GRAPH,
    );

    if (selection.usedFallback) {
      const result = fallbackResult(
        selection.reason ?? "empty_remote",
        "Remote manifest had no books; using bundled fallback.",
      );
      logManifestLoadOnce(result);
      return result;
    }

    const provenance = provenanceFromGraph(selection.graph);
    const result: SemanticGraphLoadResult = {
      graph: selection.graph,
      source: buildRemoteSource(selection.graph),
      diagnostics: [
        {
          category: "ok",
          message: isIntendedSchemaVersion(provenance.schemaVersion)
            ? "Serving validated remote semantic manifest."
            : `Serving remote semantic manifest in compatibility mode (schemaVersion ${provenance.schemaVersion ?? "legacy"}; intended ${INTENDED_SCHEMA_VERSION}).`,
        },
      ],
    };
    logManifestLoadOnce(result);
    return result;
  } catch (err) {
    logSemanticGraphError("Semantic manifest fetch failed; using bundled fallback.", err);
    const result = fallbackResult(
      "network",
      err instanceof Error ? err.message : "Semantic manifest fetch failed.",
    );
    logManifestLoadOnce(result);
    return result;
  }
}

/**
 * @deprecated Prefer {@link fetchSemanticGraphLoadResultUncached}. Returns graph only.
 */
export async function fetchSemanticGraphUncached(): Promise<SemanticGraph> {
  const result = await fetchSemanticGraphLoadResultUncached();
  return result.graph;
}

const cachedSemanticGraphLoad = cache(async () => {
  const result = await fetchSemanticGraphLoadResultUncached();
  maybeWriteBuildLock(result);
  return result;
});

/** Per-request deduplicated load result (graph + provenance). */
export async function getSemanticGraphLoadResult(): Promise<SemanticGraphLoadResult> {
  return cachedSemanticGraphLoad();
}

/** Per-request deduplicated access to the semantic graph (server components, RSC). */
export async function getSemanticGraph(): Promise<SemanticGraph> {
  const result = await cachedSemanticGraphLoad();
  return result.graph;
}

/**
 * Invalidates cached semantic graph fetches for tag {@link SEMANTIC_GRAPH_CACHE_TAG}.
 * Only effective when called from a server context (Route Handler, Server Action).
 * Uses stale-while-revalidate semantics per Next.js guidance.
 */
export function refreshSemanticGraph(): void {
  revalidateTag(SEMANTIC_GRAPH_CACHE_TAG, "max");
}

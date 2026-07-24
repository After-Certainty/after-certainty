import { cache } from "react";
import { isSemanticManifestOffline } from "@/lib/site-config";
import type { Book, SemanticGraph } from "@/types/semanticGraph";
import { validateSemanticGraph } from "@/lib/graph/validate";
import { isCompatibleSchemaVersion } from "@/lib/graph/schema-version";
import {
  buildManifestLockFromLoadResult,
  writeManifestBuildLock,
} from "@/lib/graph/build-manifest-lock";
import { loadOfflineManifestJson } from "@/lib/graph/offline-manifest";

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

/** Default fallback staleness threshold (days). Override with SEMANTIC_MANIFEST_FALLBACK_STALE_DAYS. */
export const DEFAULT_FALLBACK_STALE_DAYS = 30;

export type ManifestFailureCategory =
  | "offline"
  | "validation"
  | "incompatible_schema"
  | "invalid_fallback"
  | "incompatible_fallback";

export type ManifestReleaseIdentity = {
  schemaVersion?: string;
  sourceCommit?: string;
  generatedAt?: string;
  contentVersion?: string;
};

export type ManifestSource = {
  kind: "fallback";
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
 * Build a stable cache identity from local manifest provenance so routes share one corpus version.
 */
export function buildManifestCacheIdentity(identity: ManifestReleaseIdentity): string {
  const parts = [
    "fallback",
    "local:checkout",
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
    cacheIdentity: buildManifestCacheIdentity(provenance),
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
  let raw: unknown;
  try {
    raw = loadOfflineManifestJson();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load offline manifest.";
    logSemanticGraphError(message, err);
    return {
      ok: false,
      graph: EMPTY_GRAPH,
      category: "invalid_fallback",
      message,
    };
  }

  const validated = validateSemanticGraph(raw);
  if (!validated.success) {
    logSemanticGraphError(
      "Offline semantic manifest failed validation; using hard empty graph.",
      validated.error,
    );
    return {
      ok: false,
      graph: EMPTY_GRAPH,
      category: "invalid_fallback",
      message: "Offline semantic manifest failed validation.",
    };
  }

  if (!isCompatibleSchemaVersion(validated.data.schemaVersion)) {
    logSemanticGraphError(
      `Offline semantic manifest has incompatible schemaVersion ${validated.data.schemaVersion}.`,
    );
    return {
      ok: false,
      graph: EMPTY_GRAPH,
      category: "incompatible_fallback",
      message: `Offline schemaVersion ${validated.data.schemaVersion} is incompatible.`,
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
 * Load semantic graph from the installed local manifest or committed offline fixture.
 * Returns graph + provenance. Prefer {@link getSemanticGraphLoadResult} in new code.
 */
export async function fetchSemanticGraphLoadResultUncached(): Promise<SemanticGraphLoadResult> {
  const useLocal = process.env.SEMANTIC_MANIFEST_USE_LOCAL?.trim() === "1";
  const result = fallbackResult(
    "offline",
    useLocal
      ? "SEMANTIC_MANIFEST_USE_LOCAL=1; using local checkout manifest."
      : isSemanticManifestOffline()
        ? "SEMANTIC_MANIFEST_OFFLINE=1; using committed offline manifest fixture."
        : "Runtime remote semantic manifest fetch removed in Stage E; using committed offline manifest fixture.",
  );
  logManifestLoadOnce(result);
  return result;
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

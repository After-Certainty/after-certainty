import { cache } from "react";
import { revalidateTag } from "next/cache";
import type { ZodError } from "zod";
import fallbackSemantic from "@/data/semantic-manifest.json";
import { isSemanticManifestOffline, resolveSemanticManifestUrl } from "@/lib/site-config";
import type { Book, SemanticGraph } from "@/types/semanticGraph";
import { semanticGraphSchema, toSemanticGraph } from "@/lib/graph/schemas";

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

/** Next.js fetch / `revalidateTag` cache tag for on-demand graph refresh. */
export const SEMANTIC_GRAPH_CACHE_TAG = "semantic-graph";

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

function enrichedSourceCount(graph: SemanticGraph): number {
  return graph.sources.filter((source) => (source.creatorSlugs?.length ?? 0) > 0).length;
}

function parseGeneratedAt(graph: SemanticGraph): number {
  if (!graph.generatedAt) return 0;
  const parsed = Date.parse(graph.generatedAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Prefer the graph with richer thinker/source metadata when ISR returns a stale release. */
export function pickSemanticGraph(remote: SemanticGraph, bundled: SemanticGraph): SemanticGraph {
  const remoteEnriched = enrichedSourceCount(remote);
  const bundledEnriched = enrichedSourceCount(bundled);

  if (remoteEnriched === 0 && bundledEnriched > 0) {
    logSemanticGraphError("Remote manifest lacks source enrichment; using bundled fallback.");
    return { ...bundled, books: dedupeSemanticGraphBooks(bundled.books) };
  }

  if (bundledEnriched > remoteEnriched) {
    logSemanticGraphError(
      "Bundled manifest has richer source enrichment than remote; using bundled fallback.",
    );
    return { ...bundled, books: dedupeSemanticGraphBooks(bundled.books) };
  }

  if (
    bundledEnriched > 0 &&
    bundledEnriched === remoteEnriched &&
    parseGeneratedAt(bundled) > parseGeneratedAt(remote)
  ) {
    logSemanticGraphError("Bundled manifest is newer than remote; using bundled fallback.");
    return { ...bundled, books: dedupeSemanticGraphBooks(bundled.books) };
  }

  return { ...remote, books: dedupeSemanticGraphBooks(remote.books) };
}

/** Bundled fallback is not authoritative; production content comes from the release asset. */
function loadBundledFallbackGraph(): SemanticGraph {
  const validated = validateSemanticGraph(fallbackSemantic as unknown);
  if (validated.success) {
    return validated.data;
  }
  logSemanticGraphError(
    "Bundled semantic-manifest.json failed validation; using hard empty graph.",
    validated.error,
  );
  return EMPTY_GRAPH;
}

export type ValidateSemanticGraphResult =
  | { success: true; data: SemanticGraph; error?: undefined }
  | { success: false; data: undefined; error: ZodError | Error };

/**
 * Runtime validation for arbitrary JSON (e.g. after fetch).
 * Malformed manifests never throw; callers inspect `success`.
 */
export function validateSemanticGraph(raw: unknown): ValidateSemanticGraphResult {
  const parsed = semanticGraphSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, data: undefined, error: parsed.error };
  }
  return { success: true, data: toSemanticGraph(parsed.data) };
}

/**
 * Fetch semantic graph (ISR) or return bundled JSON when offline / on failure.
 * Exported for unit tests; production pages should call `getSemanticGraph()`.
 */
export async function fetchSemanticGraphUncached(): Promise<SemanticGraph> {
  if (isSemanticManifestOffline()) {
    return loadBundledFallbackGraph();
  }

  const url = resolveSemanticManifestUrl();

  try {
    const res = await fetch(url, {
      next: {
        revalidate: SEMANTIC_MANIFEST_REVALIDATE_SECONDS,
        tags: [SEMANTIC_GRAPH_CACHE_TAG],
      },
      headers: { Accept: "application/json, */*" },
    });

    if (!res.ok) {
      throw new Error(`semantic manifest HTTP ${res.status}`);
    }

    const data: unknown = await res.json();
    const validated = validateSemanticGraph(data);
    if (!validated.success) {
      logSemanticGraphError(
        "Remote semantic manifest validation failed; using bundled fallback.",
        validated.error,
      );
      return loadBundledFallbackGraph();
    }
    return pickSemanticGraph(validated.data, loadBundledFallbackGraph());
  } catch (err) {
    logSemanticGraphError("Semantic manifest fetch failed; using bundled fallback.", err);
    return loadBundledFallbackGraph();
  }
}

const cachedSemanticGraph = cache(fetchSemanticGraphUncached);

/** Per-request deduplicated access to the semantic graph (server components, RSC). */
export async function getSemanticGraph(): Promise<SemanticGraph> {
  return cachedSemanticGraph();
}

/**
 * Invalidates cached semantic graph fetches for tag {@link SEMANTIC_GRAPH_CACHE_TAG}.
 * Only effective when called from a server context (Route Handler, Server Action).
 * Uses stale-while-revalidate semantics per Next.js guidance.
 */
export function refreshSemanticGraph(): void {
  revalidateTag(SEMANTIC_GRAPH_CACHE_TAG, "max");
}

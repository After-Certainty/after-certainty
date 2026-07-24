import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { LOCAL_SEMANTIC_MANIFEST_RELATIVE } from "@/lib/graph/offline-manifest";
import { validateSemanticGraph } from "@/lib/graph/validate";
import type { SemanticGraph } from "@/types/semanticGraph";

/**
 * Load the same-checkout installed local manifest for full-corpus contract tests.
 * Returns null when the file is missing (local developer has not generated yet).
 */
export function tryLoadLocalSemanticManifest(
  rootDir: string = process.cwd(),
): SemanticGraph | null {
  const path = join(rootDir, LOCAL_SEMANTIC_MANIFEST_RELATIVE);
  if (!existsSync(path)) return null;
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  const validated = validateSemanticGraph(raw);
  if (!validated.success) {
    throw new Error(`${LOCAL_SEMANTIC_MANIFEST_RELATIVE} failed semantic graph validation`);
  }
  return validated.data;
}

/** Require the installed local manifest or throw an actionable error. */
export function requireLocalSemanticManifest(rootDir: string = process.cwd()): SemanticGraph {
  const graph = tryLoadLocalSemanticManifest(rootDir);
  if (!graph) {
    throw new Error(
      `${LOCAL_SEMANTIC_MANIFEST_RELATIVE} is missing. ` +
        "Run: npm run corpus:build-manifest && npm run site:install-local-manifest",
    );
  }
  return graph;
}

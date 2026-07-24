/**
 * Offline / preview manifest loading for Phase 4 (Stage C).
 *
 * When SEMANTIC_MANIFEST_USE_LOCAL=1, prefer gitignored
 * data/local-semantic-manifest.json (installed from the monorepo build/).
 * Otherwise use the committed bundled fallback.
 */

import fallbackSemantic from "@/data/semantic-manifest.json";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const LOCAL_SEMANTIC_MANIFEST_RELATIVE = "data/local-semantic-manifest.json";
export const LOCAL_INTENDED_RELEASE_RELATIVE = "data/local-intended-manifest-release.json";

/** Preview/local-checkout mode: consume installed local manifest files. */
export function isSemanticManifestUseLocal(): boolean {
  return process.env.SEMANTIC_MANIFEST_USE_LOCAL?.trim() === "1";
}

export function readJsonFileIfPresent(path: string): unknown | undefined {
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * JSON used for offline site builds. Local preview artifact when enabled;
 * otherwise the committed bundled fallback.
 */
export function loadOfflineManifestJson(rootDir: string = process.cwd()): unknown {
  if (isSemanticManifestUseLocal()) {
    const localPath = join(rootDir, LOCAL_SEMANTIC_MANIFEST_RELATIVE);
    const local = readJsonFileIfPresent(localPath);
    if (local === undefined) {
      throw new Error(
        `SEMANTIC_MANIFEST_USE_LOCAL=1 but ${LOCAL_SEMANTIC_MANIFEST_RELATIVE} is missing. ` +
          "Run: npm run site:install-local-manifest (after corpus:build-manifest).",
      );
    }
    return local;
  }
  return fallbackSemantic;
}

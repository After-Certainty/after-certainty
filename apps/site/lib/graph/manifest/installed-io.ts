/**
 * Same-checkout semantic manifest filesystem I/O.
 *
 * Production, preview, CI, and local development all consume the gitignored
 * installed artifact at data/local-semantic-manifest.json (copied from
 * build/semantic-manifest.json). There is no committed production fallback.
 */

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

const MISSING_LOCAL_HINT =
  "Run: npm run site:dev:watch  (or: npm run corpus:build-manifest && npm run site:install-local-manifest)";

/**
 * Read the installed same-checkout semantic manifest JSON from disk.
 * Always requires data/local-semantic-manifest.json — never a committed fixture.
 */
export function loadInstalledManifestJson(rootDir: string = process.cwd()): unknown {
  const localPath = join(rootDir, LOCAL_SEMANTIC_MANIFEST_RELATIVE);
  const local = readJsonFileIfPresent(localPath);
  if (local === undefined) {
    const mode = isSemanticManifestUseLocal()
      ? "SEMANTIC_MANIFEST_USE_LOCAL=1"
      : "semantic manifest load";
    throw new Error(
      `${mode} but ${LOCAL_SEMANTIC_MANIFEST_RELATIVE} is missing. ${MISSING_LOCAL_HINT}`,
    );
  }
  return local;
}

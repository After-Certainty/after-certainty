/**
 * Build-time / load-boundary record of the active semantic-manifest release.
 * Used for diagnostics and cross-route identity checks — not exposed to visitors.
 */
export type ManifestBuildLock = {
  schemaVersion: string;
  sourceCommit: string;
  generatedAt: string;
  contentVersion?: string | null;
  manifestSource: "remote" | "fallback";
  cacheIdentity: string;
  buildTime: string;
  stale: boolean;
};

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { SemanticGraphLoadResult } from "@/lib/graph/manifest";

export const MANIFEST_BUILD_LOCK_RELATIVE_PATH = "data/build-manifest-lock.json";

export function buildManifestLockFromLoadResult(
  result: SemanticGraphLoadResult,
  buildTime: string = new Date().toISOString(),
): ManifestBuildLock {
  return {
    schemaVersion: result.source.schemaVersion ?? result.graph.schemaVersion ?? "unknown",
    sourceCommit: result.source.sourceCommit ?? result.graph.sourceCommit ?? "unknown",
    generatedAt: result.source.generatedAt ?? result.graph.generatedAt ?? "unknown",
    contentVersion: result.source.contentVersion ?? result.graph.contentVersion ?? null,
    manifestSource: result.source.kind,
    cacheIdentity: result.source.cacheIdentity,
    buildTime,
    stale: result.source.stale,
  };
}

export function writeManifestBuildLock(
  lock: ManifestBuildLock,
  rootDir: string = process.cwd(),
): string {
  const path = join(rootDir, MANIFEST_BUILD_LOCK_RELATIVE_PATH);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
  return path;
}

export function releaseIdentityKey(
  lock: Pick<ManifestBuildLock, "schemaVersion" | "sourceCommit" | "generatedAt">,
): string {
  return `${lock.schemaVersion}|${lock.sourceCommit}|${lock.generatedAt}`;
}

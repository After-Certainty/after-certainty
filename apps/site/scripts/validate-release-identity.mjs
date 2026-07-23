#!/usr/bin/env node
/**
 * Assert that bundled fallback, intended release pin, and optional build lock
 * share one semantic-manifest release identity.
 *
 * Usage:
 *   npm run validate:release-identity
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function identityKey(obj) {
  return `${obj.schemaVersion ?? ""}|${obj.sourceCommit ?? ""}|${obj.generatedAt ?? ""}`;
}

function main() {
  const fallbackPath = join(root, "data", "semantic-manifest.json");
  const intendedPath = join(root, "data", "intended-manifest-release.json");
  const lockPath = join(root, "data", "build-manifest-lock.json");

  if (!existsSync(fallbackPath)) {
    throw new Error("Missing data/semantic-manifest.json");
  }
  if (!existsSync(intendedPath)) {
    throw new Error(
      "Missing data/intended-manifest-release.json — run npm run sync:semantic-manifest",
    );
  }

  const fallback = readJson(fallbackPath);
  const intended = readJson(intendedPath);
  const fallbackKey = identityKey(fallback);
  const intendedKey = identityKey(intended);

  if (fallbackKey !== intendedKey) {
    throw new Error(
      `Fallback / intended release identity mismatch:\n  fallback=${fallbackKey}\n  intended=${intendedKey}`,
    );
  }

  if (!String(fallback.schemaVersion ?? "").startsWith("2.3") && Number.parseFloat(String(fallback.schemaVersion ?? "0")) < 2.3) {
    throw new Error(
      `Bundled schemaVersion "${fallback.schemaVersion}" is below intended production contract 2.3`,
    );
  }

  if (!fallback.sourceCommit || !fallback.generatedAt) {
    throw new Error("Bundled fallback missing sourceCommit or generatedAt provenance.");
  }

  const env = {
    ...process.env,
    SEMANTIC_MANIFEST_OFFLINE: "1",
    VALIDATE_FALLBACK_STRICT: process.env.VALIDATE_FALLBACK_STRICT,
  };

  const result = spawnSync(
    "npx",
    ["vitest", "run", "lib/graph/fallback-freshness.test.ts", "lib/graph/release-identity.test.ts"],
    { cwd: root, stdio: "inherit", env },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  if (existsSync(lockPath)) {
    const lock = readJson(lockPath);
    const lockKey = identityKey(lock);
    if (lockKey !== intendedKey) {
      throw new Error(
        `Build lock / intended release identity mismatch:\n  lock=${lockKey}\n  intended=${intendedKey}`,
      );
    }
    console.log("Build lock matches intended release identity.");
  } else {
    console.log("No build-manifest-lock.json yet (ok before first production build).");
  }

  console.log("Release identity OK:", intendedKey);
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

#!/usr/bin/env node
/**
 * Sync bundled data/semantic-manifest.json from a trusted public release asset.
 *
 * Usage:
 *   npm run sync:semantic-manifest
 *   SEMANTIC_MANIFEST_URL=https://... npm run sync:semantic-manifest
 *
 * Does not run during ordinary `npm run dev`. Validates via the site Zod suite
 * after writing; restores the previous file on failure.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const targetPath = join(root, "data", "semantic-manifest.json");
const backupPath = join(root, "data", "semantic-manifest.json.bak");
const tmpPath = join(root, "data", ".semantic-manifest.json.tmp");

const DEFAULT_URL =
  "https://github.com/ksteffe/after-certainty/releases/download/latest/semantic-manifest.json";

const TRUSTED_HOST_SUFFIXES = ["github.com", "githubusercontent.com"];

function resolveUrl() {
  const envUrl = process.env.SEMANTIC_MANIFEST_URL?.trim();
  return envUrl && envUrl.length > 0 ? envUrl : DEFAULT_URL;
}

function assertTrustedUrl(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error(`Invalid manifest URL: ${urlString}`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`Manifest URL must use https: ${urlString}`);
  }
  const host = url.hostname.toLowerCase();
  const trusted = TRUSTED_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
  if (!trusted) {
    throw new Error(
      `Manifest URL host is not trusted (${host}). Allowed: ${TRUSTED_HOST_SUFFIXES.join(", ")}`,
    );
  }
  return urlString;
}

function manifestStats(data) {
  return {
    schemaVersion: data.schemaVersion ?? null,
    generatedAt: data.generatedAt ?? null,
    sourceCommit: data.sourceCommit ?? null,
    books: Array.isArray(data.books) ? data.books.length : 0,
    questions: Array.isArray(data.questions) ? data.questions.length : 0,
    trails: Array.isArray(data.trails) ? data.trails.length : 0,
    shelves: Array.isArray(data.shelves) ? data.shelves.length : 0,
    poetry: Array.isArray(data.books)
      ? data.books.filter((b) => b.contentType === "poetry").length
      : 0,
    fiction: Array.isArray(data.books)
      ? data.books.filter((b) => b.contentType === "fiction").length
      : 0,
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

async function main() {
  const url = assertTrustedUrl(resolveUrl());
  console.log(`Fetching ${url}`);

  const res = await fetch(url, {
    headers: { Accept: "application/json, */*" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching semantic manifest`);
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`Remote manifest is not valid JSON: ${err instanceof Error ? err.message : err}`);
  }

  if (!data || typeof data !== "object" || !Array.isArray(data.books)) {
    throw new Error("Remote manifest missing required books array");
  }

  const previous = existsSync(targetPath) ? readJson(targetPath) : null;
  const nextStats = manifestStats(data);
  console.log("=== Upstream ===");
  console.log(JSON.stringify(nextStats, null, 2));
  if (previous) {
    console.log("=== Bundled (previous) ===");
    console.log(JSON.stringify(manifestStats(previous), null, 2));
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  if (existsSync(targetPath)) {
    copyFileSync(targetPath, backupPath);
  }

  const formatted = `${JSON.stringify(data, null, 2)}\n`;
  writeFileSync(tmpPath, formatted, "utf8");
  renameSync(tmpPath, targetPath);

  console.log("Validating with site Zod suite (lib/graph/manifest.test.ts)…");
  const validation = spawnSync(
    "npx",
    ["vitest", "run", "lib/graph/manifest.test.ts", "lib/graph/fallback-freshness.test.ts"],
    {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, SEMANTIC_MANIFEST_OFFLINE: "1" },
    },
  );

  if (validation.status !== 0) {
    if (existsSync(backupPath)) {
      renameSync(backupPath, targetPath);
      console.error("Validation failed; restored previous bundled manifest.");
    } else if (existsSync(tmpPath)) {
      unlinkSync(tmpPath);
    }
    process.exit(validation.status ?? 1);
  }

  if (existsSync(backupPath)) {
    unlinkSync(backupPath);
  }

  console.log(`Wrote ${targetPath}`);
  console.log("Sync complete.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  if (existsSync(tmpPath)) {
    try {
      unlinkSync(tmpPath);
    } catch {
      /* ignore */
    }
  }
  process.exit(1);
});

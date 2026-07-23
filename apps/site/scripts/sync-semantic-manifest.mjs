#!/usr/bin/env node
/**
 * Sync bundled data/semantic-manifest.json from a trusted public release asset.
 *
 * Usage:
 *   npm run sync:semantic-manifest
 *   npm run sync:semantic-manifest-fallback
 *   SEMANTIC_MANIFEST_URL=https://... npm run sync:semantic-manifest
 *
 * Does not run during ordinary `npm run dev`. Validates JSON structure, schema
 * version (requires intended 2.3+), provenance, and the site Zod suite after
 * writing; restores the previous file on failure.
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const targetPath = join(root, "data", "semantic-manifest.json");
const backupPath = join(root, "data", "semantic-manifest.json.bak");
const tmpPath = join(root, "data", ".semantic-manifest.json.tmp");
const intendedIdentityPath = join(root, "data", "intended-manifest-release.json");

const DEFAULT_URL =
  "https://github.com/ksteffe/after-certainty/releases/download/latest/semantic-manifest.json";

const TRUSTED_HOST_SUFFIXES = ["github.com", "githubusercontent.com"];
const INTENDED_SCHEMA_MAJOR = 2;
const INTENDED_SCHEMA_MINOR = 3;

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

function parseSchemaVersion(schemaVersion) {
  if (!schemaVersion || typeof schemaVersion !== "string") return null;
  const match = /^(\d+)(?:\.(\d+))?/.exec(schemaVersion.trim());
  if (!match) return null;
  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2] ?? "0", 10),
    raw: schemaVersion.trim(),
  };
}

function assertIntendedSchema(data) {
  const parsed = parseSchemaVersion(data.schemaVersion);
  if (!parsed) {
    throw new Error(
      `Release alignment failed: missing or unparseable schemaVersion. Expected ${INTENDED_SCHEMA_MAJOR}.${INTENDED_SCHEMA_MINOR}+ from the production release asset.`,
    );
  }
  if (
    parsed.major !== INTENDED_SCHEMA_MAJOR ||
    parsed.minor < INTENDED_SCHEMA_MINOR
  ) {
    throw new Error(
      `Release alignment failed: schemaVersion "${parsed.raw}" is below the intended production contract ${INTENDED_SCHEMA_MAJOR}.${INTENDED_SCHEMA_MINOR}. Sync only from a released schema-${INTENDED_SCHEMA_MAJOR}.${INTENDED_SCHEMA_MINOR} artifact.`,
    );
  }
  if (parsed.major > INTENDED_SCHEMA_MAJOR) {
    throw new Error(
      `Release alignment failed: schemaVersion "${parsed.raw}" major is not yet supported by the site.`,
    );
  }
}

function assertProvenance(data) {
  if (!data.generatedAt || typeof data.generatedAt !== "string") {
    throw new Error("Release alignment failed: missing generatedAt provenance.");
  }
  if (Number.isNaN(Date.parse(data.generatedAt))) {
    throw new Error(`Release alignment failed: generatedAt is not parseable (${data.generatedAt}).`);
  }
  if (!data.sourceCommit || typeof data.sourceCommit !== "string") {
    throw new Error("Release alignment failed: missing sourceCommit provenance.");
  }
}

function assertNoHiddenExposure(data) {
  const hiddenEvents = Array.isArray(data.changeEvents)
    ? data.changeEvents.filter((e) => e && e.visibility === "hidden")
    : [];
  // Hidden events may exist in the corpus; public surfaces filter them. Fail only if
  // a clearly private manuscript chapter is marked public with a sourcePath leak pattern.
  const chapters = Array.isArray(data.chapters) ? data.chapters : [];
  for (const chapter of chapters) {
    if (!chapter || typeof chapter !== "object") continue;
    if (chapter.public === false) continue;
    if (typeof chapter.sourcePath === "string" && chapter.sourcePath.includes("/private/")) {
      throw new Error(
        `Release alignment failed: public chapter "${chapter.id}" references a private sourcePath.`,
      );
    }
  }
  return { hiddenChangeEvents: hiddenEvents.length };
}

function manifestStats(data) {
  return {
    schemaVersion: data.schemaVersion ?? null,
    generatedAt: data.generatedAt ?? null,
    sourceCommit: data.sourceCommit ?? null,
    contentVersion: data.contentVersion ?? null,
    books: Array.isArray(data.books) ? data.books.length : 0,
    chapters: Array.isArray(data.chapters) ? data.chapters.length : 0,
    parts: Array.isArray(data.parts) ? data.parts.length : 0,
    questions: Array.isArray(data.questions) ? data.questions.length : 0,
    trails: Array.isArray(data.trails) ? data.trails.length : 0,
    shelves: Array.isArray(data.shelves) ? data.shelves.length : 0,
    poetry: Array.isArray(data.books)
      ? data.books.filter((b) => b.contentType === "poetry").length
      : 0,
    fiction: Array.isArray(data.books)
      ? data.books.filter((b) => b.contentType === "fiction").length
      : 0,
    conceptRoles: Array.isArray(data.books)
      ? data.books.filter((b) => (b.overview?.selectedConceptRoles ?? []).length > 0).length
      : 0,
    patternGrounding: Array.isArray(data.patterns)
      ? data.patterns.filter((p) => p.grounding).length
      : 0,
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeIntendedIdentity(data, url) {
  const identity = {
    schemaVersion: data.schemaVersion,
    sourceCommit: data.sourceCommit,
    generatedAt: data.generatedAt,
    contentVersion: data.contentVersion ?? null,
    manifestUrl: url,
    syncedAt: new Date().toISOString(),
  };
  writeFileSync(intendedIdentityPath, `${JSON.stringify(identity, null, 2)}\n`, "utf8");
  return identity;
}

function restoreBackup() {
  if (existsSync(backupPath)) {
    renameSync(backupPath, targetPath);
    console.error("Validation failed; restored previous bundled manifest.");
  }
  if (existsSync(tmpPath)) {
    try {
      unlinkSync(tmpPath);
    } catch {
      /* ignore */
    }
  }
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

  assertIntendedSchema(data);
  assertProvenance(data);
  const hidden = assertNoHiddenExposure(data);

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

  const identity = writeIntendedIdentity(data, url);
  const bytes = statSync(targetPath).size;

  console.log("Validating with site Zod suite…");
  const validation = spawnSync(
    "npx",
    [
      "vitest",
      "run",
      "lib/graph/manifest.test.ts",
      "lib/graph/fallback-freshness.test.ts",
      "lib/graph/schema-version.test.ts",
    ],
    {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, SEMANTIC_MANIFEST_OFFLINE: "1" },
    },
  );

  if (validation.status !== 0) {
    restoreBackup();
    process.exit(validation.status ?? 1);
  }

  if (existsSync(backupPath)) {
    unlinkSync(backupPath);
  }

  console.log(`Wrote ${targetPath} (${bytes} bytes)`);
  console.log("=== Release identity ===");
  console.log(JSON.stringify({ ...identity, hiddenChangeEvents: hidden.hiddenChangeEvents }, null, 2));
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

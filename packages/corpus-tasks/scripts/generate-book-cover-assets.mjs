#!/usr/bin/env node
/**
 * Generate deterministic WebP book-cover derivatives for the site.
 *
 * Inputs: public book metadata via tools/list_book_covers.py
 * Outputs:
 *   build/site-assets/book-covers/<slug>/{detail,card,thumbnail}.webp
 *   build/site-assets/book-covers/manifest.json
 *
 * Usage (from monorepo root):
 *   node packages/corpus-tasks/scripts/generate-book-cover-assets.mjs
 *   npm run build-web-covers -w @after-certainty/corpus-tasks
 */

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  GENERATOR_VERSION,
  PORTABLE_PATH_PREFIX,
  SITE_GENERATED_URL_PREFIX,
  VARIANT_KEYS,
  VARIANTS,
  variantConfigFingerprint,
} from "./book-cover-variants.mjs";

/** @type {typeof import("sharp") | null} */
let sharpModulePromise = null;

async function loadSharp() {
  if (sharpModulePromise) return sharpModulePromise;
  sharpModulePromise = (async () => {
    try {
      const mod = await import("sharp");
      return mod.default;
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? err.code : undefined;
      if (code === "ERR_MODULE_NOT_FOUND" || code === "MODULE_NOT_FOUND") {
        return null;
      }
      throw err;
    }
  })();
  return sharpModulePromise;
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../../..");
const DEFAULT_OUT = path.join(ROOT, "build/site-assets/book-covers");

function sha256Buffer(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function sha256File(filePath) {
  return sha256Buffer(readFileSync(filePath));
}

function parseArgs(argv) {
  const args = {
    repo: ROOT,
    out: DEFAULT_OUT,
    force: false,
    dryRun: false,
    allowMissingSharp: process.env.ALLOW_MISSING_WEB_COVERS === "1",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--repo" && argv[i + 1]) {
      args.repo = path.resolve(argv[++i]);
    } else if (a === "--out" && argv[i + 1]) {
      args.out = path.resolve(argv[++i]);
    } else if (a === "--force") {
      args.force = true;
    } else if (a === "--dry-run") {
      args.dryRun = true;
    } else if (a === "--allow-missing-sharp") {
      args.allowMissingSharp = true;
    } else if (a === "--help" || a === "-h") {
      console.log(
        `Usage: generate-book-cover-assets.mjs [--repo DIR] [--out DIR] [--force] [--dry-run] [--allow-missing-sharp]`,
      );
      process.exit(0);
    }
  }
  return args;
}

function resolvePython(repo) {
  if (process.env.PYTHON) return process.env.PYTHON;
  const venvPy = path.join(repo, ".venv/bin/python3");
  if (existsSync(venvPy)) return venvPy;
  return "python3";
}

function listBookCovers(repo) {
  const script = path.join(repo, "tools/list_book_covers.py");
  const result = spawnSync(
    resolvePython(repo),
    [script, "--repo", repo, "--eligible-only"],
    {
      cwd: repo,
      encoding: "utf8",
      env: {
        ...process.env,
        PYTHONPATH: [path.join(repo, "tools"), process.env.PYTHONPATH]
          .filter(Boolean)
          .join(path.delimiter),
      },
    },
  );
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "list_book_covers failed").trim();
    throw new Error(err);
  }
  const parsed = JSON.parse(result.stdout || "[]");
  if (!Array.isArray(parsed)) {
    throw new Error("list_book_covers.py must return a JSON array");
  }
  return parsed;
}

function loadExistingManifest(outDir) {
  const manifestPath = path.join(outDir, "manifest.json");
  if (!existsSync(manifestPath)) return { books: {} };
  try {
    const raw = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (raw && typeof raw === "object" && raw.books && typeof raw.books === "object") {
      return raw;
    }
  } catch {
    // regenerate from scratch
  }
  return { books: {} };
}

function recordIsFresh(record, sourceSha256, variantConfig) {
  if (!record || typeof record !== "object") return false;
  if (record.sourceSha256 !== sourceSha256) return false;
  if (record.generatorVersion !== GENERATOR_VERSION) return false;
  if (record.variantConfig !== variantConfig) return false;
  const images = record.coverImages;
  if (!images || typeof images !== "object") return false;
  for (const key of VARIANT_KEYS) {
    const v = images[key];
    if (!v || typeof v !== "object") return false;
    if (!v.path || !v.sha256 || !v.width || !v.height || !v.bytes) return false;
  }
  return true;
}

function outputsExist(outDir, slug, record) {
  for (const key of VARIANT_KEYS) {
    const filePath = path.join(outDir, slug, `${key}.webp`);
    if (!existsSync(filePath)) return false;
    const expected = record.coverImages?.[key]?.sha256;
    if (!expected) return false;
    if (sha256File(filePath) !== expected) return false;
  }
  return true;
}

async function generateVariant(sharpLib, sourcePath, maxWidth, quality) {
  const pipeline = sharpLib(sourcePath, { failOn: "error" })
    .rotate()
    .resize({
      width: maxWidth,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toColorspace("srgb");

  const { data, info } = await pipeline
    .webp({ quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    bytes: data.length,
    format: "webp",
    sha256: sha256Buffer(data),
  };
}

function atomicWriteFile(destPath, buffer) {
  const dir = path.dirname(destPath);
  mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(destPath)}.${process.pid}.tmp`);
  writeFileSync(tmp, buffer);
  renameSync(tmp, destPath);
}

function ensureSafeSlug(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error("missing book slug");
  }
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\") || slug.startsWith(".")) {
    throw new Error(`unsafe book slug: ${slug}`);
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(slug)) {
    throw new Error(`unsafe book slug: ${slug}`);
  }
  return slug;
}

function ensureCoverInsideRepo(repo, coverPath) {
  const abs = path.resolve(repo, coverPath);
  const rel = path.relative(repo, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`cover path escapes repo: ${coverPath}`);
  }
  if (!abs.startsWith(path.join(repo, "books") + path.sep) && !abs.startsWith(path.join(repo, "upcoming") + path.sep)) {
    throw new Error(`cover path outside books/upcoming: ${coverPath}`);
  }
  if (!existsSync(abs) || !statSync(abs).isFile()) {
    throw new Error(`cover file missing: ${coverPath}`);
  }
  return abs;
}

/**
 * @param {{ repo: string, out: string, force?: boolean, dryRun?: boolean, allowMissingSharp?: boolean, books?: object[], sharpLib?: import("sharp").default }} opts
 */
export async function generateBookCoverAssets(opts) {
  const repo = path.resolve(opts.repo);
  const outDir = path.resolve(opts.out);
  const force = Boolean(opts.force);
  const dryRun = Boolean(opts.dryRun);
  const variantConfig = variantConfigFingerprint();

  const sharpLib = opts.sharpLib ?? (await loadSharp());
  if (!sharpLib) {
    if (opts.allowMissingSharp || process.env.ALLOW_MISSING_WEB_COVERS === "1") {
      console.warn(
        "warning: sharp is not installed; skipping book cover generation (npm ci to enable)",
      );
      return { generated: 0, skipped: 0, failed: 0, softWarnings: [], books: {}, skippedMissingSharp: true };
    }
    throw new Error(
      "Cannot find package 'sharp'. Run npm ci from the monorepo root, or pass --allow-missing-sharp / ALLOW_MISSING_WEB_COVERS=1 for Python-only CI.",
    );
  }

  const books = opts.books ?? listBookCovers(repo);
  const existing = loadExistingManifest(outDir);
  /** @type {Record<string, object>} */
  const nextBooks = {};

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  const softWarnings = [];

  for (const entry of books) {
    const slug = ensureSafeSlug(entry.slug);
    if (!entry.coverPath || entry.status === "draft" || entry.eligible === false) {
      continue;
    }

    let sourceAbs;
    try {
      sourceAbs = ensureCoverInsideRepo(repo, entry.coverPath);
    } catch (err) {
      failed += 1;
      console.error(`error [${slug}]: ${err instanceof Error ? err.message : err}`);
      continue;
    }

    const sourceSha256 = sha256File(sourceAbs);
    const prior = existing.books?.[slug];
    if (
      !force &&
      recordIsFresh(prior, sourceSha256, variantConfig) &&
      outputsExist(outDir, slug, prior)
    ) {
      nextBooks[slug] = prior;
      skipped += 1;
      continue;
    }

    if (dryRun) {
      console.log(`would generate ${slug} from ${entry.coverPath}`);
      generated += 1;
      continue;
    }

    try {
      const sourceMeta = await sharpLib(sourceAbs, { failOn: "error" }).metadata();
      const sourceWidth = sourceMeta.width ?? 0;
      const sourceHeight = sourceMeta.height ?? 0;
      if (!sourceWidth || !sourceHeight) {
        throw new Error("could not read source dimensions");
      }

      /** @type {Record<string, object>} */
      const coverImages = {};
      for (const key of VARIANT_KEYS) {
        const spec = VARIANTS[key];
        const variant = await generateVariant(sharpLib, sourceAbs, spec.maxWidth, spec.quality);
        if (variant.width > sourceWidth || variant.height > sourceHeight) {
          throw new Error(
            `${key} enlarged source (${variant.width}x${variant.height} > ${sourceWidth}x${sourceHeight})`,
          );
        }
        if (variant.bytes > spec.hardMaxBytes) {
          throw new Error(
            `${key} exceeds hard ceiling ${spec.hardMaxBytes} bytes (got ${variant.bytes})`,
          );
        }
        if (variant.bytes > spec.softMaxBytes) {
          softWarnings.push(
            `${slug}/${key}.webp is ${variant.bytes} bytes (soft target ${spec.softMaxBytes})`,
          );
        }

        const relPortable = `${PORTABLE_PATH_PREFIX}/${slug}/${key}.webp`;
        const dest = path.join(outDir, slug, `${key}.webp`);
        atomicWriteFile(dest, variant.buffer);

        coverImages[key] = {
          path: relPortable,
          url: `${SITE_GENERATED_URL_PREFIX}/${slug}/${key}.webp`,
          width: variant.width,
          height: variant.height,
          format: "webp",
          bytes: variant.bytes,
          sha256: variant.sha256,
        };
      }

      nextBooks[slug] = {
        slug,
        sourcePath: entry.coverPath,
        sourceSha256,
        sourceWidth,
        sourceHeight,
        generatorVersion: GENERATOR_VERSION,
        variantConfig,
        coverImages,
      };
      generated += 1;
      console.log(`generated ${slug}`);
    } catch (err) {
      failed += 1;
      console.error(`error [${slug}]: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (dryRun) {
    return { generated, skipped, failed, softWarnings, books: nextBooks };
  }

  // Prune orphaned slug directories and stale variant files
  mkdirSync(outDir, { recursive: true });
  const keepSlugs = new Set(Object.keys(nextBooks));
  for (const name of readdirSync(outDir, { withFileTypes: true })) {
    if (!name.isDirectory()) continue;
    const slug = name.name;
    const dir = path.join(outDir, slug);
    if (!keepSlugs.has(slug)) {
      rmSync(dir, { recursive: true, force: true });
      console.log(`removed stale cover dir ${slug}`);
      continue;
    }
    for (const file of readdirSync(dir)) {
      if (!VARIANT_KEYS.includes(file.replace(/\.webp$/, "")) && file.endsWith(".webp")) {
        // unexpected variant name
        rmSync(path.join(dir, file), { force: true });
      } else if (!file.endsWith(".webp") && !file.startsWith(".")) {
        // leave non-webp alone only if expected; otherwise remove junk
        if (!VARIANT_KEYS.map((k) => `${k}.webp`).includes(file)) {
          rmSync(path.join(dir, file), { force: true });
        }
      }
    }
    for (const key of VARIANT_KEYS) {
      const expected = path.join(dir, `${key}.webp`);
      if (!existsSync(expected)) {
        throw new Error(`missing generated file after build: ${slug}/${key}.webp`);
      }
    }
  }

  const manifest = {
    generatorVersion: GENERATOR_VERSION,
    variantConfig,
    generatedAt: new Date().toISOString(),
    books: Object.fromEntries(Object.entries(nextBooks).sort(([a], [b]) => a.localeCompare(b))),
  };

  const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
  atomicWriteFile(path.join(outDir, "manifest.json"), Buffer.from(manifestJson, "utf8"));

  for (const w of softWarnings) {
    console.warn(`warning: ${w}`);
  }

  console.log(
    `book covers: generated=${generated} skipped=${skipped} failed=${failed} total=${Object.keys(nextBooks).length}`,
  );

  if (failed > 0) {
    const err = new Error(`book cover generation failed for ${failed} book(s)`);
    err.code = "COVER_GENERATION_FAILED";
    throw err;
  }

  return { generated, skipped, failed, softWarnings, books: nextBooks, manifest };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    await generateBookCoverAssets(args);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

const isDirect =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
  main();
}

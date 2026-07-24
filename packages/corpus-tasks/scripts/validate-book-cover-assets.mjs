#!/usr/bin/env node
/**
 * Validate generated book-cover derivatives against metadata and (optionally) the
 * semantic manifest / installed site public tree.
 *
 * Usage:
 *   node packages/corpus-tasks/scripts/validate-book-cover-assets.mjs
 *   npm run validate-web-covers -w @after-certainty/corpus-tasks
 */

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import {
  GENERATOR_VERSION,
  PORTABLE_PATH_PREFIX,
  SITE_GENERATED_URL_PREFIX,
  VARIANT_KEYS,
  VARIANTS,
} from "./book-cover-variants.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../../..");
const DEFAULT_OUT = path.join(ROOT, "build/site-assets/book-covers");
const DEFAULT_SITE = path.join(ROOT, "apps/site/public/generated/book-covers");
const DEFAULT_MANIFEST = path.join(ROOT, "build/semantic-manifest.json");

function sha256File(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function isWebp(filePath) {
  const buf = readFileSync(filePath);
  return buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";
}

function parseArgs(argv) {
  const args = {
    repo: ROOT,
    out: DEFAULT_OUT,
    site: DEFAULT_SITE,
    semanticManifest: DEFAULT_MANIFEST,
    requireInstalled: false,
    requireSemantic: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--repo" && argv[i + 1]) args.repo = path.resolve(argv[++i]);
    else if (a === "--out" && argv[i + 1]) args.out = path.resolve(argv[++i]);
    else if (a === "--site" && argv[i + 1]) args.site = path.resolve(argv[++i]);
    else if (a === "--semantic-manifest" && argv[i + 1]) {
      args.semanticManifest = path.resolve(argv[++i]);
    } else if (a === "--require-installed") args.requireInstalled = true;
    else if (a === "--require-semantic") args.requireSemantic = true;
  }
  return args;
}

function resolvePython(repo) {
  if (process.env.PYTHON) return process.env.PYTHON;
  const venvPy = path.join(repo, ".venv/bin/python3");
  if (existsSync(venvPy)) return venvPy;
  return "python3";
}

function listEligible(repo) {
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
    throw new Error((result.stderr || result.stdout || "list_book_covers failed").trim());
  }
  return JSON.parse(result.stdout || "[]");
}

function aspectRatio(w, h) {
  return w / h;
}

/**
 * @param {{ repo: string, out: string, site?: string, semanticManifest?: string, requireInstalled?: boolean, requireSemantic?: boolean }} opts
 */
export async function validateBookCoverAssets(opts) {
  const repo = path.resolve(opts.repo);
  const outDir = path.resolve(opts.out);
  const errors = [];
  const warnings = [];

  const coverManifestPath = path.join(outDir, "manifest.json");
  if (!existsSync(coverManifestPath)) {
    errors.push(`missing cover manifest: ${coverManifestPath}`);
    return { ok: false, errors, warnings };
  }

  const coverManifest = JSON.parse(readFileSync(coverManifestPath, "utf8"));
  const booksMeta = coverManifest.books || {};
  const eligible = listEligible(repo);
  const eligibleSlugs = new Set(eligible.map((e) => e.slug));

  for (const entry of eligible) {
    if (!booksMeta[entry.slug]) {
      errors.push(`eligible book missing from cover manifest: ${entry.slug}`);
    }
  }

  const seenPaths = new Set();
  for (const [slug, record] of Object.entries(booksMeta)) {
    if (!eligibleSlugs.has(slug)) {
      errors.push(`cover manifest includes non-eligible / hidden book: ${slug}`);
      continue;
    }
    if (record.generatorVersion !== GENERATOR_VERSION) {
      warnings.push(`${slug}: generatorVersion ${record.generatorVersion} != ${GENERATOR_VERSION}`);
    }
    const sourceAbs = path.resolve(repo, record.sourcePath);
    if (!existsSync(sourceAbs)) {
      errors.push(`${slug}: source missing ${record.sourcePath}`);
      continue;
    }
    const sourceSha = sha256File(sourceAbs);
    if (sourceSha !== record.sourceSha256) {
      errors.push(`${slug}: sourceSha256 mismatch`);
    }
    const sourceMeta = await sharp(sourceAbs).metadata();
    const sw = sourceMeta.width ?? 0;
    const sh = sourceMeta.height ?? 0;

    for (const key of VARIANT_KEYS) {
      const variant = record.coverImages?.[key];
      if (!variant) {
        errors.push(`${slug}: missing coverImages.${key}`);
        continue;
      }
      if (variant.format !== "webp") {
        errors.push(`${slug}/${key}: format must be webp`);
      }
      if (!Number.isInteger(variant.width) || variant.width <= 0) {
        errors.push(`${slug}/${key}: invalid width`);
      }
      if (!Number.isInteger(variant.height) || variant.height <= 0) {
        errors.push(`${slug}/${key}: invalid height`);
      }
      if (!Number.isInteger(variant.bytes) || variant.bytes <= 0) {
        errors.push(`${slug}/${key}: invalid bytes`);
      }
      if (!/^[a-f0-9]{64}$/.test(String(variant.sha256 || ""))) {
        errors.push(`${slug}/${key}: invalid sha256`);
      }
      if (variant.width > sw || variant.height > sh) {
        errors.push(`${slug}/${key}: enlarged beyond source`);
      }
      if (variant.width > VARIANTS[key].maxWidth) {
        errors.push(`${slug}/${key}: width ${variant.width} > max ${VARIANTS[key].maxWidth}`);
      }
      const expectedPath = `${PORTABLE_PATH_PREFIX}/${slug}/${key}.webp`;
      if (variant.path !== expectedPath) {
        errors.push(`${slug}/${key}: path ${variant.path} != ${expectedPath}`);
      }
      const expectedUrl = `${SITE_GENERATED_URL_PREFIX}/${slug}/${key}.webp`;
      if (variant.url !== expectedUrl) {
        errors.push(`${slug}/${key}: url ${variant.url} != ${expectedUrl}`);
      }
      if (seenPaths.has(variant.path)) {
        errors.push(`duplicate path ${variant.path}`);
      }
      seenPaths.add(variant.path);

      const filePath = path.join(outDir, slug, `${key}.webp`);
      if (!existsSync(filePath)) {
        errors.push(`missing file ${filePath}`);
        continue;
      }
      if (!isWebp(filePath)) {
        errors.push(`${filePath} is not a WebP`);
      }
      const st = statSync(filePath);
      if (st.size !== variant.bytes) {
        errors.push(`${slug}/${key}: bytes ${st.size} != metadata ${variant.bytes}`);
      }
      const fileSha = sha256File(filePath);
      if (fileSha !== variant.sha256) {
        errors.push(`${slug}/${key}: sha256 mismatch`);
      }
      const meta = await sharp(filePath).metadata();
      if (meta.width !== variant.width || meta.height !== variant.height) {
        errors.push(
          `${slug}/${key}: dims ${meta.width}x${meta.height} != ${variant.width}x${variant.height}`,
        );
      }
      if (sw && sh && meta.width && meta.height) {
        const srcAr = aspectRatio(sw, sh);
        const outAr = aspectRatio(meta.width, meta.height);
        if (Math.abs(srcAr - outAr) > 0.02) {
          errors.push(`${slug}/${key}: aspect ratio drift ${outAr.toFixed(4)} vs ${srcAr.toFixed(4)}`);
        }
      }
    }
  }

  // Stale directories under outDir
  if (existsSync(outDir)) {
    for (const ent of readdirSync(outDir, { withFileTypes: true })) {
      if (ent.isDirectory() && !booksMeta[ent.name]) {
        errors.push(`stale generated directory: ${ent.name}`);
      }
    }
  }

  if (opts.requireInstalled) {
    const siteDir = path.resolve(opts.site || DEFAULT_SITE);
    for (const [slug, record] of Object.entries(booksMeta)) {
      for (const key of VARIANT_KEYS) {
        const siteFile = path.join(siteDir, slug, `${key}.webp`);
        if (!existsSync(siteFile)) {
          errors.push(`missing installed site asset: ${siteFile}`);
          continue;
        }
        if (sha256File(siteFile) !== record.coverImages[key].sha256) {
          errors.push(`installed site asset hash mismatch: ${slug}/${key}`);
        }
      }
    }
    if (existsSync(siteDir)) {
      for (const ent of readdirSync(siteDir, { withFileTypes: true })) {
        if (ent.isDirectory() && !booksMeta[ent.name]) {
          errors.push(`stale installed site cover dir: ${ent.name}`);
        }
      }
    }
  }

  if (opts.requireSemantic) {
    const semPath = path.resolve(opts.semanticManifest || DEFAULT_MANIFEST);
    if (!existsSync(semPath)) {
      errors.push(`semantic manifest missing: ${semPath}`);
    } else {
      const sem = JSON.parse(readFileSync(semPath, "utf8"));
      const semBooks = Array.isArray(sem.books) ? sem.books : [];
      for (const book of semBooks) {
        const slug = book.slug;
        if (!eligibleSlugs.has(slug)) continue;
        if (!book.coverImagePath && !booksMeta[slug]) continue;
        if (book.coverImagePath && !book.coverImages) {
          errors.push(`semantic book ${slug} has cover but missing coverImages`);
          continue;
        }
        if (book.coverImages) {
          for (const key of VARIANT_KEYS) {
            const v = book.coverImages[key];
            const expected = booksMeta[slug]?.coverImages?.[key];
            if (!v || !expected) {
              errors.push(`semantic ${slug} missing coverImages.${key}`);
              continue;
            }
            if (v.path !== expected.path || v.sha256 !== expected.sha256) {
              errors.push(`semantic ${slug}/${key} does not match generated metadata`);
            }
          }
        }
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await validateBookCoverAssets(args);
  for (const w of result.warnings) console.warn(`warning: ${w}`);
  for (const e of result.errors) console.error(`error: ${e}`);
  if (!result.ok) {
    console.error(`validate-book-cover-assets: ${result.errors.length} error(s)`);
    process.exit(1);
  }
  console.log("validate-book-cover-assets: OK");
}

const isDirect =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

#!/usr/bin/env node
/**
 * Validate that a reader passage fragment id exists in rendered chapter HTML.
 *
 * Uses the same pipeline as the online reader (renderManuscriptHtml), loaded
 * via the workspace-pinned `jiti` (no network / npx install).
 *
 * Usage (from apps/site or repo root):
 *   node apps/site/scripts/validate-reader-passage-fragment.mjs \
 *     --book-dir books/coupling \
 *     --source-path parts/.../chapter.md \
 *     --fragment user-content-fnref-c16-opening \
 *     [--repo /path/to/repo]
 *
 * Prints a single JSON object to stdout.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function print(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

async function main() {
  const bookDir = argValue("--book-dir");
  const sourcePath = argValue("--source-path");
  const fragment = argValue("--fragment");
  const repoArg = argValue("--repo");

  if (!bookDir || !sourcePath || !fragment) {
    print({
      ok: false,
      error: "required: --book-dir, --source-path, --fragment",
    });
    return 2;
  }

  const siteRoot = path.dirname(fileURLToPath(import.meta.url));
  const appsSite = path.resolve(siteRoot, "..");
  const repoRoot = repoArg
    ? path.resolve(repoArg)
    : path.resolve(appsSite, "..", "..");

  const markdownPath = path.join(repoRoot, bookDir, sourcePath);
  if (!fs.existsSync(markdownPath)) {
    print({
      ok: false,
      fragment,
      error: `manuscript not found: ${bookDir}/${sourcePath}`,
    });
    return 1;
  }

  const jiti = createJiti(import.meta.url, {
    alias: { "@": appsSite },
  });
  const { renderManuscriptHtml } = await jiti.import(
    path.join(appsSite, "lib/reading/render-manuscript-html.ts"),
  );

  const markdown = fs.readFileSync(markdownPath, "utf8");
  const html = await renderManuscriptHtml({
    markdown,
    bookDir,
    sourcePath,
  });

  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const idRe = new RegExp(`\\sid="${escaped}"`, "i");
  if (!idRe.test(html)) {
    print({
      ok: false,
      fragment,
      error: "fragment not found in rendered HTML",
    });
    return 1;
  }

  print({ ok: true, fragment });
  return 0;
}

const code = await main().catch((err) => {
  print({
    ok: false,
    error: err instanceof Error ? err.message : String(err),
  });
  return 1;
});
process.exit(code);

/**
 * LEGACY — prefer `validate-reader-passage-fragment.mjs`.
 *
 * Kept only so TypeScript tooling can typecheck the same logic. Do not invoke
 * this entry with `npx tsx` (network install). The supported CLI is:
 *
 *   node apps/site/scripts/validate-reader-passage-fragment.mjs \
 *     --book-dir books/... \
 *     --source-path parts/.../chapter.md \
 *     --fragment user-content-fnref-... \
 *     [--repo /path/to/repo]
 *
 * That `.mjs` loads the reader pipeline via the workspace-pinned `jiti`
 * dependency declared in `apps/site/package.json`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderManuscriptHtml } from "../lib/reading/render-manuscript-html";
import { resolveMonorepoRoot } from "../lib/reading/repo-root";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function print(payload: Record<string, unknown>): void {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

async function main(): Promise<number> {
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

  const repoRoot = repoArg ? path.resolve(repoArg) : resolveMonorepoRoot();
  const markdownPath = path.join(repoRoot, bookDir, sourcePath);
  if (!fs.existsSync(markdownPath)) {
    print({
      ok: false,
      fragment,
      error: `manuscript not found: ${bookDir}/${sourcePath}`,
    });
    return 1;
  }

  const markdown = fs.readFileSync(markdownPath, "utf8");
  const html = await renderManuscriptHtml({
    markdown,
    bookDir,
    sourcePath,
  });

  // Match id="fragment" with optional other attributes between.
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

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main()
    .then((code) => process.exit(code))
    .catch((err: unknown) => {
      print({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
      process.exit(1);
    });
}

export { main as validateReaderPassageFragmentMain };

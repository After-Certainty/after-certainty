import fs from "node:fs";
import path from "node:path";

/**
 * Resolve the monorepo root (directory containing `books/` and `apps/site/`).
 * Works when cwd is the repo root or `apps/site` (Vercel / Next).
 */
export function resolveMonorepoRoot(startDir: string = process.cwd()): string {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 8; i += 1) {
    const books = path.join(dir, "books");
    const site = path.join(dir, "apps", "site");
    if (fs.existsSync(books) && fs.existsSync(site)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: assume cwd is apps/site
  return path.resolve(startDir, "../..");
}

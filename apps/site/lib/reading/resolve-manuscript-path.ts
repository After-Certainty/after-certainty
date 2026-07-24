import fs from "node:fs";
import path from "node:path";

import { resolveMonorepoRoot } from "@/lib/reading/repo-root";
import type { Book } from "@/types/semanticGraph";

export type ManuscriptPathResult =
  | { ok: true; absolutePath: string; bookRoot: string; source: "installed" | "checkout" }
  | { ok: false; reason: "missing_book_dir" | "path_escape" | "not_found" | "not_file"; detail: string };

function normalizeBookDirRel(book: Pick<Book, "slug" | "bookDir">): string | null {
  const bookDirRel = (book.bookDir?.trim() || `books/${book.slug}`).replace(/^\/+|\/+$/g, "");
  if (!bookDirRel || bookDirRel.includes("..") || path.isAbsolute(bookDirRel)) {
    return null;
  }
  if (!bookDirRel.startsWith("books/") && bookDirRel !== "books") {
    return null;
  }
  return bookDirRel;
}

/**
 * Candidate roots that mirror `bookDir` under an installed manuscripts tree
 * (`apps/site/data/manuscripts/books/...`) — preferred on Vercel.
 */
export function installedManuscriptRoots(startDir: string = process.cwd()): string[] {
  const cwd = path.resolve(startDir);
  const candidates = [
    path.join(cwd, "data", "manuscripts"),
    path.join(cwd, "apps", "site", "data", "manuscripts"),
  ];
  try {
    const repoRoot = resolveMonorepoRoot(cwd);
    candidates.push(path.join(repoRoot, "apps", "site", "data", "manuscripts"));
  } catch {
    // ignore
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    if (fs.existsSync(resolved)) out.push(resolved);
  }
  return out;
}

function tryResolveUnderRoot(input: {
  root: string;
  bookDirRel: string;
  sourcePath: string;
  requireBooksContainment: boolean;
}): ManuscriptPathResult | null {
  const bookRoot = path.resolve(input.root, input.bookDirRel);
  if (input.requireBooksContainment) {
    const booksRoot = path.resolve(input.root, "books");
    if (!bookRoot.startsWith(booksRoot + path.sep) && bookRoot !== booksRoot) {
      return {
        ok: false,
        reason: "path_escape",
        detail: `bookDir escapes books/: ${input.bookDirRel}`,
      };
    }
  } else {
    // Installed tree: manuscripts/books/...
    const booksRoot = path.resolve(input.root, "books");
    if (!bookRoot.startsWith(booksRoot + path.sep) && bookRoot !== booksRoot) {
      return {
        ok: false,
        reason: "path_escape",
        detail: `bookDir escapes installed manuscripts/books: ${input.bookDirRel}`,
      };
    }
  }

  const absolutePath = path.resolve(bookRoot, input.sourcePath);
  if (!absolutePath.startsWith(bookRoot + path.sep) && absolutePath !== bookRoot) {
    return {
      ok: false,
      reason: "path_escape",
      detail: `sourcePath escapes book root: ${input.sourcePath}`,
    };
  }
  if (!fs.existsSync(absolutePath)) return null;
  if (!fs.statSync(absolutePath).isFile()) {
    return {
      ok: false,
      reason: "not_file",
      detail: `Manuscript path is not a file: ${input.sourcePath}`,
    };
  }
  return { ok: true, absolutePath, bookRoot, source: "checkout" };
}

/**
 * Resolve a chapter manuscript file under the book root.
 * Prefers installed `apps/site/data/manuscripts/{bookDir}` (Vercel-safe),
 * then falls back to the monorepo checkout `books/`.
 */
export function resolveManuscriptPath(input: {
  book: Pick<Book, "slug" | "bookDir">;
  sourcePath: string;
  repoRoot?: string;
}): ManuscriptPathResult {
  const sourcePath = input.sourcePath.trim().replace(/^\/+/, "");
  if (!sourcePath || sourcePath.includes("\0")) {
    return { ok: false, reason: "path_escape", detail: "Empty or invalid sourcePath." };
  }

  const bookDirRel = normalizeBookDirRel(input.book);
  if (!bookDirRel) {
    return {
      ok: false,
      reason: "path_escape",
      detail: `Unsafe bookDir "${input.book.bookDir ?? ""}".`,
    };
  }

  for (const installedRoot of installedManuscriptRoots()) {
    const hit = tryResolveUnderRoot({
      root: installedRoot,
      bookDirRel,
      sourcePath,
      requireBooksContainment: true,
    });
    if (hit?.ok) {
      return { ...hit, source: "installed" };
    }
    if (hit && !hit.ok && hit.reason === "path_escape") return hit;
  }

  const repoRoot = input.repoRoot ?? resolveMonorepoRoot();
  const checkout = tryResolveUnderRoot({
    root: repoRoot,
    bookDirRel,
    sourcePath,
    requireBooksContainment: true,
  });
  if (checkout?.ok) {
    return { ...checkout, source: "checkout" };
  }
  if (checkout && !checkout.ok) return checkout;

  return {
    ok: false,
    reason: "not_found",
    detail: `Manuscript not found: ${bookDirRel}/${sourcePath}`,
  };
}

import fs from "node:fs";
import path from "node:path";

import { resolveMonorepoRoot } from "@/lib/reading/repo-root";
import type { Book } from "@/types/semanticGraph";

export type ManuscriptPathResult =
  | { ok: true; absolutePath: string; bookRoot: string }
  | { ok: false; reason: "missing_book_dir" | "path_escape" | "not_found" | "not_file"; detail: string };

/**
 * Resolve a chapter manuscript file under the book root.
 * Prefers manifest `bookDir`; falls back to `books/{slug}`.
 */
export function resolveManuscriptPath(input: {
  book: Pick<Book, "slug" | "bookDir">;
  sourcePath: string;
  repoRoot?: string;
}): ManuscriptPathResult {
  const repoRoot = input.repoRoot ?? resolveMonorepoRoot();
  const sourcePath = input.sourcePath.trim().replace(/^\/+/, "");
  if (!sourcePath || sourcePath.includes("\0")) {
    return { ok: false, reason: "path_escape", detail: "Empty or invalid sourcePath." };
  }

  const bookDirRel = (input.book.bookDir?.trim() || `books/${input.book.slug}`).replace(
    /^\/+|\/+$/g,
    "",
  );
  if (bookDirRel.includes("..") || path.isAbsolute(bookDirRel)) {
    return {
      ok: false,
      reason: "path_escape",
      detail: `Unsafe bookDir "${bookDirRel}".`,
    };
  }

  const bookRoot = path.resolve(repoRoot, bookDirRel);
  const booksRoot = path.resolve(repoRoot, "books");
  if (!bookRoot.startsWith(booksRoot + path.sep) && bookRoot !== booksRoot) {
    return {
      ok: false,
      reason: "path_escape",
      detail: `bookDir escapes books/: ${bookDirRel}`,
    };
  }

  const absolutePath = path.resolve(bookRoot, sourcePath);
  if (!absolutePath.startsWith(bookRoot + path.sep) && absolutePath !== bookRoot) {
    return {
      ok: false,
      reason: "path_escape",
      detail: `sourcePath escapes book root: ${sourcePath}`,
    };
  }

  if (!fs.existsSync(absolutePath)) {
    return {
      ok: false,
      reason: "not_found",
      detail: `Manuscript not found: ${bookDirRel}/${sourcePath}`,
    };
  }
  if (!fs.statSync(absolutePath).isFile()) {
    return {
      ok: false,
      reason: "not_file",
      detail: `Manuscript path is not a file: ${sourcePath}`,
    };
  }

  return { ok: true, absolutePath, bookRoot };
}

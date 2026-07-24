import path from "node:path";

import { chapterPublicPath } from "@/lib/graph/chapters";
import type { ManifestChapter } from "@/types/semanticGraph";

export type ManuscriptChapterLinkTarget = {
  sourcePath: string;
  routeKey: string;
  title: string;
};

/** Normalize titles for Contents-style fragment link matching. */
export function normalizeManuscriptLinkTitle(title: string): string {
  return title
    .normalize("NFKC")
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Resolve a relative `.md` href against the current chapter sourcePath into a
 * book-relative sourcePath (posix). Returns null when the path escapes the book.
 */
export function resolveManuscriptMdTarget(
  currentSourcePath: string,
  hrefPath: string,
): string | null {
  const cleaned = hrefPath.trim().replace(/^\.\//, "");
  if (!cleaned || cleaned.startsWith("/") || /^[a-z]+:/i.test(cleaned)) return null;
  const fromDir = path.posix.dirname(currentSourcePath.replace(/\\/g, "/"));
  const joined = path.posix.normalize(path.posix.join(fromDir, cleaned));
  if (joined.startsWith("../") || joined === "..") return null;
  return joined.replace(/^\.\//, "");
}

export function manuscriptChapterLinkTargets(
  chapters: readonly Pick<ManifestChapter, "sourcePath" | "routeKey" | "title" | "public">[],
): ManuscriptChapterLinkTarget[] {
  const out: ManuscriptChapterLinkTarget[] = [];
  for (const chapter of chapters) {
    if (!chapter.public) continue;
    const href = chapterPublicPath(chapter);
    if (!href) continue;
    const sourcePath = chapter.sourcePath?.trim().replace(/\\/g, "/");
    if (!sourcePath) continue;
    out.push({
      sourcePath,
      routeKey: href,
      title: chapter.title,
    });
  }
  return out;
}

/**
 * Rewrite in-manuscript links for the native reader:
 * - Relative `.md` targets that match a public chapter → chapter routeKey
 * - `#fragment` links whose link text uniquely matches a chapter title → routeKey
 * - Unresolved `.md` links → plain text (no broken relative hrefs)
 * - Image markdown and non-`.md` / unmatched `#` links left unchanged
 */
export function rewriteManuscriptChapterLinks(
  markdown: string,
  input: {
    sourcePath: string;
    chapters: readonly ManuscriptChapterLinkTarget[];
  },
): string {
  const currentSource = input.sourcePath.replace(/\\/g, "/");
  const bySourcePath = new Map(
    input.chapters.map((chapter) => [chapter.sourcePath.replace(/\\/g, "/"), chapter]),
  );
  const byTitle = new Map<string, ManuscriptChapterLinkTarget[]>();
  for (const chapter of input.chapters) {
    const key = normalizeManuscriptLinkTitle(chapter.title);
    const list = byTitle.get(key) ?? [];
    list.push(chapter);
    byTitle.set(key, list);
  }

  let out = "";
  let i = 0;
  while (i < markdown.length) {
    const open = markdown.indexOf("[", i);
    if (open < 0) {
      out += markdown.slice(i);
      break;
    }
    out += markdown.slice(i, open);
    if (open > 0 && markdown[open - 1] === "!") {
      out += "[";
      i = open + 1;
      continue;
    }

    const closeLabel = markdown.indexOf("]", open + 1);
    if (closeLabel < 0 || markdown[closeLabel + 1] !== "(") {
      out += "[";
      i = open + 1;
      continue;
    }
    const closeHref = markdown.indexOf(")", closeLabel + 2);
    if (closeHref < 0) {
      out += "[";
      i = open + 1;
      continue;
    }

    const label = markdown.slice(open + 1, closeLabel);
    const href = markdown.slice(closeLabel + 2, closeHref).trim();
    const full = markdown.slice(open, closeHref + 1);

    const hashIndex = href.indexOf("#");
    const pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
    const fragment = hashIndex >= 0 ? href.slice(hashIndex) : "";

    if (!href) {
      out += full;
      i = closeHref + 1;
      continue;
    }

    if (!pathPart) {
      const matches = byTitle.get(normalizeManuscriptLinkTitle(label)) ?? [];
      const unique = matches.length === 1 ? matches[0] : undefined;
      if (unique && unique.sourcePath !== currentSource) {
        out += `[${label}](${unique.routeKey})`;
      } else {
        out += full;
      }
      i = closeHref + 1;
      continue;
    }

    if (!/\.md$/i.test(pathPart)) {
      out += full;
      i = closeHref + 1;
      continue;
    }

    const resolved = resolveManuscriptMdTarget(currentSource, pathPart);
    const target = resolved ? bySourcePath.get(resolved) : undefined;
    if (!target) {
      out += label;
      i = closeHref + 1;
      continue;
    }

    if (target.sourcePath === currentSource && fragment) {
      out += `[${label}](${fragment})`;
    } else {
      out += `[${label}](${target.routeKey})`;
    }
    i = closeHref + 1;
  }

  return out;
}

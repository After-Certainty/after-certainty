import fs from "node:fs/promises";

import { publicChaptersForEdition } from "@/lib/graph/chapters";
import { renderManuscriptHtml } from "@/lib/reading/render-manuscript-html";
import { manuscriptChapterLinkTargets } from "@/lib/reading/rewrite-manuscript-chapter-links";
import { resolveManuscriptPath } from "@/lib/reading/resolve-manuscript-path";
import { siteConfig } from "@/lib/site-config";
import type { Book, ManifestChapter, SemanticGraph } from "@/types/semanticGraph";

export type ChapterManuscriptResult =
  | {
      status: "ok";
      html: string;
      sourcePath: string;
      absolutePath: string;
    }
  | {
      status: "missing" | "unsafe" | "error";
      message: string;
      sourcePath?: string;
    };

/**
 * Load and render a chapter manuscript for the Native Reader (READ-003).
 */
export async function loadChapterManuscript(input: {
  book: Book;
  chapter: ManifestChapter;
  /** When provided, in-manuscript TOC / `.md` links rewrite to chapter routes. */
  graph?: SemanticGraph;
  repoRoot?: string;
}): Promise<ChapterManuscriptResult> {
  const sourcePath = input.chapter.sourcePath?.trim();
  if (!sourcePath) {
    return { status: "missing", message: "This chapter has no manuscript source path." };
  }

  const resolved = resolveManuscriptPath({
    book: input.book,
    sourcePath,
    repoRoot: input.repoRoot,
  });

  if (!resolved.ok) {
    if (resolved.reason === "path_escape") {
      return { status: "unsafe", message: "Manuscript path could not be resolved safely.", sourcePath };
    }
    return {
      status: "missing",
      message: "The chapter manuscript file was not found in this checkout.",
      sourcePath,
    };
  }

  try {
    const markdown = await fs.readFile(resolved.absolutePath, "utf8");
    const bookDir = (input.book.bookDir?.trim() || `books/${input.book.slug}`).replace(
      /^\/+|\/+$/g,
      "",
    );
    const editionId = input.book.editionId ?? input.book.id;
    const chapterLinkTargets = input.graph
      ? manuscriptChapterLinkTargets(publicChaptersForEdition(input.graph, editionId))
      : undefined;
    const html = await renderManuscriptHtml({
      markdown,
      bookDir,
      githubRepoUrl: siteConfig.githubUrl,
      sourcePath,
      chapterLinkTargets,
    });
    return {
      status: "ok",
      html,
      sourcePath,
      absolutePath: resolved.absolutePath,
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Failed to render manuscript.",
      sourcePath,
    };
  }
}

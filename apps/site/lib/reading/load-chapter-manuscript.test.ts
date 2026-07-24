import { describe, expect, it } from "vitest";

import { loadChapterManuscript } from "@/lib/reading/load-chapter-manuscript";
import { resolveMonorepoRoot } from "@/lib/reading/repo-root";
import type { Book, ManifestChapter } from "@/types/semanticGraph";

describe("loadChapterManuscript", () => {
  it("renders the After Certainty introduction from the corpus checkout", async () => {
    const book: Book = {
      id: "book-after-certainty",
      slug: "after-certainty",
      title: "After Certainty",
      bookDir: "books/after-certainty",
    };
    const chapter: ManifestChapter = {
      id: "chapter-after-certainty-front-matter-introduction",
      workId: "work-after-certainty",
      editionId: "book-after-certainty",
      title: "Introduction",
      position: 1,
      kind: "introduction",
      sourcePath: "front-matter/introduction.md",
      wordCount: 1000,
      estimatedReadingMinutes: 5,
      public: true,
      routeKey: "/explore/books/after-certainty/chapters/front-matter-introduction",
    };

    const result = await loadChapterManuscript({
      book,
      chapter,
      repoRoot: resolveMonorepoRoot(),
    });

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.html).toContain("What Remains After Understanding");
      expect(result.html).toContain("data-footnote-ref");
      expect(result.html).not.toContain("<script>");
      // Leading H1 stripped — shell owns the chapter title.
      expect(result.html).not.toMatch(/^<h1[\s>]/i);
    }
  });

  it("returns a missing state for an unknown sourcePath", async () => {
    const result = await loadChapterManuscript({
      book: {
        id: "book-after-certainty",
        slug: "after-certainty",
        title: "After Certainty",
        bookDir: "books/after-certainty",
      },
      chapter: {
        id: "chapter-missing",
        workId: "work-after-certainty",
        editionId: "book-after-certainty",
        title: "Missing",
        position: 99,
        kind: "chapter",
        sourcePath: "does-not-exist.md",
        wordCount: 1,
        estimatedReadingMinutes: 1,
        public: true,
        routeKey: "/explore/books/after-certainty/chapters/does-not-exist",
      },
      repoRoot: resolveMonorepoRoot(),
    });
    expect(result.status).toBe("missing");
  });
});

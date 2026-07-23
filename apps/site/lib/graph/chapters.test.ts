import semanticManifest from "@/data/semantic-manifest.json";
import { describe, expect, it } from "vitest";

import {
  chapterSlugFromRouteKey,
  chaptersForEdition,
  partsForEdition,
  publicChaptersForEdition,
} from "@/lib/graph/chapters";
import { collectChapterStructureHealthIssues } from "@/lib/graph/validate-chapters";
import { validateSemanticGraph } from "@/lib/graph/validate";
import type { SemanticGraph } from "@/types/semanticGraph";

const validated = validateSemanticGraph(semanticManifest as unknown);
if (!validated.success) {
  throw new Error("Bundled semantic-manifest.json failed validation in chapter tests");
}
const graph = validated.data;

describe("chapters discovery", () => {
  it("derives chapter slugs from routeKey", () => {
    expect(
      chapterSlugFromRouteKey("/explore/books/after-certainty/chapters/front-matter-introduction"),
    ).toBe("front-matter-introduction");
  });

  it("indexes parts and public chapters for After Certainty", () => {
    const editionId = "book-after-certainty";
    const parts = partsForEdition(graph, editionId);
    const chapters = publicChaptersForEdition(graph, editionId);
    expect(parts.length).toBeGreaterThan(0);
    expect(chapters.length).toBeGreaterThan(0);
    expect(chapters.every((chapter) => chapter.public)).toBe(true);
    expect(chapters.map((c) => c.position)).toEqual(
      [...chapters].map((c) => c.position).sort((a, b) => a - b),
    );
    expect(chaptersForEdition(graph, editionId).length).toBe(chapters.length);
  });
});

describe("chapter structure health", () => {
  it("passes for the bundled production manifest", () => {
    const issues = collectChapterStructureHealthIssues({ graph });
    expect(issues.filter((i) => i.severity === "error")).toEqual([]);
  });

  it("flags unknown chapter editions", () => {
    const broken: SemanticGraph = {
      ...graph,
      chapters: [
        {
          id: "chapter-orphan",
          workId: "work-after-certainty",
          editionId: "book-does-not-exist",
          title: "Orphan",
          position: 1,
          kind: "chapter",
          sourcePath: "x.md",
          wordCount: 10,
          estimatedReadingMinutes: 1,
          public: true,
          routeKey: "/explore/books/x/chapters/orphan",
        },
      ],
    };
    const issues = collectChapterStructureHealthIssues({ graph: broken });
    expect(issues.some((i) => i.code === "unknown_chapter_edition")).toBe(true);
  });
});

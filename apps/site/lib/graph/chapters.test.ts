import { describe, expect, it } from "vitest";

import {
  chapterSlugFromRouteKey,
  chaptersForEdition,
  partsForEdition,
  publicChaptersForEdition,
} from "@/lib/graph/chapters";
import { collectChapterStructureHealthIssues } from "@/lib/graph/validate-chapters";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";
import type { SemanticGraph } from "@/types/semanticGraph";

const enriched = loadManifestFixture("enriched-book");
const localGraph = tryLoadLocalSemanticManifest();

describe("chapters discovery", () => {
  it("derives chapter slugs from routeKey", () => {
    expect(
      chapterSlugFromRouteKey("/explore/books/after-certainty/chapters/front-matter-introduction"),
    ).toBe("front-matter-introduction");
  });

  it("indexes parts and public chapters for After Certainty", () => {
    const editionId = "book-after-certainty";
    const parts = partsForEdition(enriched, editionId);
    const chapters = publicChaptersForEdition(enriched, editionId);
    expect(parts.length).toBeGreaterThan(0);
    expect(chapters.length).toBeGreaterThan(0);
    expect(chapters.every((chapter) => chapter.public)).toBe(true);
    expect(chapters.map((c) => c.position)).toEqual(
      [...chapters].map((c) => c.position).sort((a, b) => a - b),
    );
    expect(chaptersForEdition(enriched, editionId).length).toBe(chapters.length);
  });
});

describe.skipIf(!localGraph)("chapter structure health (local manifest)", () => {
  it("passes for the generated local manifest", () => {
    const issues = collectChapterStructureHealthIssues({ graph: localGraph! });
    expect(issues.filter((i) => i.severity === "error")).toEqual([]);
  });
});

describe("chapter structure health", () => {
  it("flags unknown chapter editions", () => {
    const broken: SemanticGraph = {
      ...enriched,
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

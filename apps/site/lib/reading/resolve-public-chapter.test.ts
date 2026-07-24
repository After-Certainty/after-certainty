import { describe, expect, it } from "vitest";

import { buildChapterRouteKey } from "@/lib/graph/chapters";
import { resolvePublicChapter } from "@/lib/reading/resolve-public-chapter";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import type { SemanticGraph } from "@/types/semanticGraph";

const enriched = loadManifestFixture("enriched-book");

describe("resolvePublicChapter (READ-002)", () => {
  it("resolves a public chapter by edition and chapter slug", () => {
    const resolved = resolvePublicChapter({
      graph: enriched,
      editionSlug: "after-certainty",
      chapterSlug: "front-matter-introduction",
    });
    expect(resolved).not.toBeNull();
    expect(resolved!.book.slug).toBe("after-certainty");
    expect(resolved!.chapter.title).toBe("Introduction");
    expect(resolved!.pathname).toBe(
      "/explore/books/after-certainty/chapters/front-matter-introduction",
    );
    expect(resolved!.pathname).toBe(
      buildChapterRouteKey("after-certainty", "front-matter-introduction"),
    );
  });

  it("returns null for unknown book or chapter", () => {
    expect(
      resolvePublicChapter({
        graph: enriched,
        editionSlug: "no-such-book",
        chapterSlug: "front-matter-introduction",
      }),
    ).toBeNull();
    expect(
      resolvePublicChapter({
        graph: enriched,
        editionSlug: "after-certainty",
        chapterSlug: "no-such-chapter",
      }),
    ).toBeNull();
  });

  it("returns null for private chapters", () => {
    const sample = (enriched.chapters ?? []).find(
      (chapter) => chapter.editionId === "book-after-certainty",
    );
    expect(sample).toBeTruthy();
    const privateGraph: SemanticGraph = {
      ...enriched,
      chapters: [
        {
          ...sample!,
          public: false,
        },
      ],
    };
    const slug = sample!.routeKey.split("/").pop()!;
    expect(
      resolvePublicChapter({
        graph: privateGraph,
        editionSlug: "after-certainty",
        chapterSlug: slug,
      }),
    ).toBeNull();
  });
});

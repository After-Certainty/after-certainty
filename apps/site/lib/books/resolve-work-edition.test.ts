import { describe, expect, it } from "vitest";

import semanticManifest from "@/data/semantic-manifest.json";
import {
  buildEditionGroups,
  buildResolvedEditionIndex,
  isCanonicalEdition,
  resolveWorkEdition,
} from "@/lib/books/resolve-work-edition";
import { parsePublicationRegistry } from "@/lib/books/publication-registry-schema";
import type { Book } from "@/types/semanticGraph";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph = semanticManifest as unknown as SemanticGraph;

function book(over: Partial<Book> & Pick<Book, "id" | "slug">): Book {
  return {
    title: over.title ?? over.slug,
    ...over,
  };
}

describe("resolve-work-edition", () => {
  it("uses the publication registry for the bundled corpus", () => {
    const index = buildResolvedEditionIndex(graph.books);
    expect(index.size).toBe(graph.books.length);

    const v1 = index.get("when-others-look-to-you-v1");
    const v2 = index.get("when-others-look-to-you-v2");
    expect(v1?.workId).toBe("work-when-others-look-to-you");
    expect(v2?.workId).toBe("work-when-others-look-to-you");
    expect(v1?.isCanonical).toBe(true);
    expect(v2?.isCanonical).toBe(false);
    expect(v2?.relationship).toBe("companion");
    expect(v2?.relationship).not.toBe("superseded");
    expect(v2?.editionLabel).toBe("Companion edition");
    expect(v2?.canonicalSlug).toBe("when-others-look-to-you-v1");
    expect(v2?.companionOfSlug).toBe("when-others-look-to-you-v1");
  });

  it("marks sole registered books canonical", () => {
    const after = resolveWorkEdition(
      graph.books.find((b) => b.slug === "after-certainty")!,
      graph.books,
    );
    expect(after.isCanonical).toBe(true);
    expect(after.relationship).toBe("sole");
    expect(after.workId).toBe("work-after-certainty");
    expect(after.editionLabel).toBeUndefined();
  });

  it("falls back to heuristics for unregistered synthetic siblings", () => {
    const books = [
      book({
        id: "book-demo-v1",
        slug: "demo-v1",
        epub: { enabled: true, file: "a.epub", url: "https://example.com/a.epub" },
      }),
      book({ id: "book-demo-v2", slug: "demo-v2" }),
    ];
    const emptyRegistry = parsePublicationRegistry({
      manifestVersion: 1,
      editions: [
        {
          bookId: "book-unrelated",
          slug: "unrelated",
          workId: "work-unrelated",
          isCanonical: true,
          relationship: "sole",
        },
      ],
    });

    const index = buildResolvedEditionIndex(books, emptyRegistry);
    expect(index.get("demo-v1")?.isCanonical).toBe(true);
    expect(index.get("demo-v2")?.isCanonical).toBe(false);
    expect(index.get("demo-v2")?.relationship).not.toBe("superseded");
    expect(isCanonicalEdition(books[0]!, books, emptyRegistry)).toBe(true);
    expect(buildEditionGroups(books, emptyRegistry).get("demo-v2")?.canonicalSlug).toBe("demo-v1");
  });

  it("never marks registry companions as superseded via groups", () => {
    const groups = buildEditionGroups(graph.books);
    expect(groups.get("when-others-look-to-you-v2")?.canonicalSlug).toBe(
      "when-others-look-to-you-v1",
    );
    expect(groups.get("when-others-look-to-you-v2")?.siblingCount).toBe(2);
  });
});

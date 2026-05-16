import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { isValidExploreFocusKind, resolveExploreFocusCanonicalId } from "@/lib/explore/resolveExploreFocus";
import type { SemanticGraph } from "@/types/semanticGraph";
import type { Book as CatalogBook } from "@/types/content";

const graph: SemanticGraph = {
  books: [{ id: "bid", slug: "my-book", title: "My Book", concepts: [], patterns: [], sources: [] }],
  glossary: [{ id: "cid", slug: "my-concept", title: "C", shortDefinition: "x" }],
  patterns: [{ id: "pid", slug: "my-pattern", title: "P", summary: "y" }],
  sources: [{ id: "sid", slug: "my-source", name: "S", type: "thinker" }],
  relationships: [],
};

describe("resolveExploreFocusCanonicalId", () => {
  it("rejects blank slug after trim", () => {
    const index = buildGraphIndex(graph);
    expect(resolveExploreFocusCanonicalId(index, "concept", "   ")).toBeNull();
  });

  it("returns null for book slug not in graph when no catalog hint", () => {
    const index = buildGraphIndex(graph);
    expect(resolveExploreFocusCanonicalId(index, "book", "missing")).toBeNull();
  });

  it("resolves each kind by slug", () => {
    const index = buildGraphIndex(graph);
    expect(resolveExploreFocusCanonicalId(index, "book", "my-book")).toBe("bid");
    expect(resolveExploreFocusCanonicalId(index, "concept", "my-concept")).toBe("cid");
    expect(resolveExploreFocusCanonicalId(index, "pattern", "my-pattern")).toBe("pid");
    expect(resolveExploreFocusCanonicalId(index, "source", "my-source")).toBe("sid");
  });

  it("resolves book slug via catalog canonical row", () => {
    const index = buildGraphIndex(graph);
    const catalog: CatalogBook[] = [
      { slug: "my-book", title: "My Book", description: "d", status: "published", authors: [], slugAliases: ["alias-book"] },
    ];
    expect(resolveExploreFocusCanonicalId(index, "book", "alias-book", catalog)).toBe("bid");
  });
});

describe("isValidExploreFocusKind", () => {
  it("accepts supported graph entity kinds", () => {
    expect(isValidExploreFocusKind("concept")).toBe(true);
    expect(isValidExploreFocusKind("pattern")).toBe(true);
    expect(isValidExploreFocusKind("book")).toBe(true);
    expect(isValidExploreFocusKind("source")).toBe(true);
  });

  it("rejects other strings", () => {
    expect(isValidExploreFocusKind("essay")).toBe(false);
    expect(isValidExploreFocusKind("")).toBe(false);
  });
});

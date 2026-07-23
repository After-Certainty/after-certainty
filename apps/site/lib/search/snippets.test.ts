import { describe, expect, it } from "vitest";

import {
  buildSearchSnippet,
  highlightRangesForQuery,
  snippetSegments,
} from "@/lib/search/snippets";
import type { SearchDocument } from "@/lib/search/types";

function doc(
  partial: Partial<SearchDocument> & Pick<SearchDocument, "id" | "title">,
): SearchDocument {
  return {
    entityType: "concept",
    slug: partial.slug ?? partial.id,
    resultLabel: "Concept",
    canonicalUrl: "/explore/concepts/x",
    visibility: "listed",
    searchText: partial.searchText ?? partial.title,
    aliases: [],
    boostWeight: 1,
    sourceArtifact: "semantic",
    ...partial,
  };
}

describe("buildSearchSnippet", () => {
  it("prefers description windows that mention query tokens", () => {
    const snippet = buildSearchSnippet(
      "trust",
      doc({
        id: "concept-trust",
        title: "Trust",
        description:
          "Trust is not blind belief. It is the extension of action beyond what one person can personally verify.",
      }),
    );
    expect(snippet?.text.toLowerCase()).toContain("trust");
    expect(snippet?.highlights.length).toBeGreaterThan(0);
  });

  it("does not interpret HTML as markup in the snippet text", () => {
    const snippet = buildSearchSnippet(
      "certainty",
      doc({
        id: "concept-certainty",
        title: "Certainty",
        description: 'A posture of <script>alert("x")</script> knowing.',
      }),
    );
    expect(snippet?.text).toContain("<script>");
    const joined = snippetSegments(snippet!)
      .map((s) => s.text)
      .join("");
    expect(joined).toContain("<script>");
    expect(joined).not.toMatch(/^<mark>/);
  });
});

describe("highlightRangesForQuery", () => {
  it("merges overlapping token ranges", () => {
    const ranges = highlightRangesForQuery("trust disagreement trust", "trust");
    expect(ranges).toEqual([
      { start: 0, end: 5 },
      { start: 19, end: 24 },
    ]);
  });

  it("ignores stopwords when choosing highlight tokens", () => {
    const ranges = highlightRangesForQuery(
      "Why collaboration fails in teams",
      "Why does collaboration fail?",
    );
    expect(ranges.some((r) => r.start === 4 && r.end === 17)).toBe(true);
  });
});

describe("snippetSegments", () => {
  it("splits plain and highlighted runs for React rendering", () => {
    const segments = snippetSegments({
      text: "trust and disagreement",
      highlights: [{ start: 0, end: 5 }],
    });
    expect(segments).toEqual([
      { text: "trust", highlight: true },
      { text: " and disagreement", highlight: false },
    ]);
  });
});

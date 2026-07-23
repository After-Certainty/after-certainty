import { describe, expect, it } from "vitest";

import {
  exceptionAllowsConcept,
  exceptionAllowsPattern,
  indexOverviewLinkExceptions,
  parseOverviewLinkExceptions,
} from "@/lib/books/overview-link-exceptions";

describe("overview-link-exceptions", () => {
  it("rejects invalid exception files", () => {
    expect(() => parseOverviewLinkExceptions({ version: 2, exceptions: [] })).toThrow();
    expect(() =>
      parseOverviewLinkExceptions({
        version: 1,
        exceptions: [{ bookSlug: "Bad_Slug", reason: "x" }],
      }),
    ).toThrow();
  });

  it("matches wildcard and explicit concept/pattern allowances", () => {
    const bySlug = indexOverviewLinkExceptions([
      {
        bookSlug: "observer-patterns",
        conceptIds: "*",
        patternIds: ["pattern-attention-finds-a-focus"],
        reason: "test",
      },
    ]);
    const ex = bySlug.get("observer-patterns");
    expect(exceptionAllowsConcept(ex, "concept-anything")).toBe(true);
    expect(exceptionAllowsPattern(ex, "pattern-attention-finds-a-focus")).toBe(true);
    expect(exceptionAllowsPattern(ex, "pattern-other")).toBe(false);
  });
});

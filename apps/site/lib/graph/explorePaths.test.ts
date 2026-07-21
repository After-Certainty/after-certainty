import { describe, expect, it } from "vitest";

import { exploreObservatoryPathwayHref, pathwayFromSearchParams } from "@/lib/graph/explorePaths";

describe("exploreObservatoryPathwayHref", () => {
  it("builds a pathway deep link with observatory view", () => {
    expect(
      exploreObservatoryPathwayHref({ kind: "trail", slug: "judgment-before-certainty" }),
    ).toBe("/explore?pathwayKind=trail&pathwaySlug=judgment-before-certainty&view=observatory");
  });

  it("includes an optional step param", () => {
    expect(
      exploreObservatoryPathwayHref({
        kind: "question",
        slug: "act-before-certainty-arrives",
        step: 3,
      }),
    ).toContain("pathwayStep=3");
  });
});

describe("pathwayFromSearchParams", () => {
  it("parses pathway query params", () => {
    const params = new URLSearchParams(
      "pathwayKind=trail&pathwaySlug=judgment-before-certainty&pathwayStep=2",
    );
    expect(pathwayFromSearchParams(params)).toEqual({
      kind: "trail",
      slug: "judgment-before-certainty",
      step: "2",
    });
  });
});

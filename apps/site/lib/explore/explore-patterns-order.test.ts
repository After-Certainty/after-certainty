import { describe, expect, it } from "vitest";

import {
  explorePatternAdjacentInIndexOrder,
  patternsSortedForExploreIndex,
} from "@/lib/explore/explore-patterns-order";
import type { Pattern } from "@/types/semanticGraph";

const p = (slug: string, title: string, summary = "s"): Pattern => ({
  id: `id-${slug}`,
  slug,
  title,
  summary,
});

describe("patternsSortedForExploreIndex", () => {
  it("sorts by title with localeCompare and does not mutate the input array", () => {
    const input: Pattern[] = [p("z", "Zeta"), p("a", "alpha"), p("m", "Mu")];
    const sorted = patternsSortedForExploreIndex(input);
    expect(sorted.map((x) => x.title)).toEqual(["alpha", "Mu", "Zeta"]);
    expect(input[0]!.title).toBe("Zeta");
  });
});

describe("explorePatternAdjacentInIndexOrder", () => {
  const sorted = patternsSortedForExploreIndex([p("slug-b", "B"), p("slug-a", "A"), p("slug-c", "C")]);

  it("returns empty object when slug is not in the list", () => {
    expect(explorePatternAdjacentInIndexOrder(sorted, "missing")).toEqual({});
  });

  it("returns only next for the first pattern in explore order", () => {
    expect(explorePatternAdjacentInIndexOrder(sorted, "slug-a")).toEqual({
      prev: undefined,
      next: { id: "id-slug-b", slug: "slug-b", title: "B", summary: "s" },
    });
  });

  it("returns only prev for the last pattern in explore order", () => {
    expect(explorePatternAdjacentInIndexOrder(sorted, "slug-c")).toEqual({
      prev: { id: "id-slug-b", slug: "slug-b", title: "B", summary: "s" },
      next: undefined,
    });
  });

  it("returns both prev and next in the middle", () => {
    expect(explorePatternAdjacentInIndexOrder(sorted, "slug-b")).toEqual({
      prev: { id: "id-slug-a", slug: "slug-a", title: "A", summary: "s" },
      next: { id: "id-slug-c", slug: "slug-c", title: "C", summary: "s" },
    });
  });
});

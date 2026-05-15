import { describe, expect, it } from "vitest";

import {
  exploreSourceAdjacentInIndexOrder,
  sourcesSortedForExploreIndex,
} from "@/lib/explore/explore-sources-order";
import type { Source } from "@/types/semanticGraph";

const s = (slug: string, name: string): Source => ({
  id: `id-${slug}`,
  slug,
  name,
  type: "thinker",
});

describe("sourcesSortedForExploreIndex", () => {
  it("sorts by name with localeCompare and does not mutate the input array", () => {
    const input: Source[] = [s("z", "Zoe"), s("a", "ada"), s("m", "Morgan")];
    const sorted = sourcesSortedForExploreIndex(input);
    expect(sorted.map((x) => x.name)).toEqual(["ada", "Morgan", "Zoe"]);
    expect(input[0]!.name).toBe("Zoe");
  });
});

describe("exploreSourceAdjacentInIndexOrder", () => {
  const sorted = sourcesSortedForExploreIndex([s("slug-b", "B"), s("slug-a", "A"), s("slug-c", "C")]);

  it("returns empty object when slug is not in the list", () => {
    expect(exploreSourceAdjacentInIndexOrder(sorted, "missing")).toEqual({});
  });

  it("returns only next for the first source in explore order", () => {
    expect(exploreSourceAdjacentInIndexOrder(sorted, "slug-a")).toEqual({
      prev: undefined,
      next: { id: "id-slug-b", slug: "slug-b", name: "B", type: "thinker" },
    });
  });

  it("returns both prev and next in the middle", () => {
    expect(exploreSourceAdjacentInIndexOrder(sorted, "slug-b")).toEqual({
      prev: { id: "id-slug-a", slug: "slug-a", name: "A", type: "thinker" },
      next: { id: "id-slug-c", slug: "slug-c", name: "C", type: "thinker" },
    });
  });
});

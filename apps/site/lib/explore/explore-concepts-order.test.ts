import { describe, expect, it } from "vitest";

import {
  conceptsSortedForExploreIndex,
  exploreConceptAdjacentInIndexOrder,
} from "@/lib/explore/explore-concepts-order";
import type { GlossaryConcept } from "@/types/semanticGraph";

const c = (slug: string, title: string): GlossaryConcept => ({
  id: `id-${slug}`,
  slug,
  title,
  shortDefinition: "def",
});

describe("conceptsSortedForExploreIndex", () => {
  it("sorts by title with localeCompare and does not mutate the input array", () => {
    const input: GlossaryConcept[] = [c("z", "Zebra"), c("a", "apple"), c("m", "Mango")];
    const sorted = conceptsSortedForExploreIndex(input);
    expect(sorted.map((x) => x.title)).toEqual(["apple", "Mango", "Zebra"]);
    expect(input[0]!.title).toBe("Zebra");
  });
});

describe("exploreConceptAdjacentInIndexOrder", () => {
  const sorted = conceptsSortedForExploreIndex([c("slug-b", "B"), c("slug-a", "A"), c("slug-c", "C")]);

  it("returns empty object when slug is not in the list", () => {
    expect(exploreConceptAdjacentInIndexOrder(sorted, "missing")).toEqual({});
  });

  it("returns only next for the first concept in explore order", () => {
    expect(exploreConceptAdjacentInIndexOrder(sorted, "slug-a")).toEqual({
      prev: undefined,
      next: { id: "id-slug-b", slug: "slug-b", title: "B", shortDefinition: "def" },
    });
  });

  it("returns both prev and next in the middle", () => {
    expect(exploreConceptAdjacentInIndexOrder(sorted, "slug-b")).toEqual({
      prev: { id: "id-slug-a", slug: "slug-a", title: "A", shortDefinition: "def" },
      next: { id: "id-slug-c", slug: "slug-c", title: "C", shortDefinition: "def" },
    });
  });
});

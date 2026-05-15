import { describe, expect, it } from "vitest";

import { booksSortedForExploreIndex, exploreBookAdjacentInIndexOrder } from "@/lib/explore/explore-books-order";
import type { Book } from "@/types/semanticGraph";

const b = (slug: string, title: string): Book => ({
  id: `id-${slug}`,
  slug,
  title,
});

describe("booksSortedForExploreIndex", () => {
  it("sorts by title with localeCompare and does not mutate the input array", () => {
    const input: Book[] = [b("z", "Zebra"), b("a", "apple"), b("m", "Mango")];
    const sorted = booksSortedForExploreIndex(input);
    expect(sorted.map((x) => x.title)).toEqual(["apple", "Mango", "Zebra"]);
    expect(input[0]!.title).toBe("Zebra");
  });
});

describe("exploreBookAdjacentInIndexOrder", () => {
  const sorted = booksSortedForExploreIndex([b("slug-b", "B"), b("slug-a", "A"), b("slug-c", "C")]);

  it("returns empty object when slug is not in the list", () => {
    expect(exploreBookAdjacentInIndexOrder(sorted, "missing")).toEqual({});
  });

  it("returns only next for the first book in explore order", () => {
    expect(exploreBookAdjacentInIndexOrder(sorted, "slug-a")).toEqual({
      prev: undefined,
      next: { id: "id-slug-b", slug: "slug-b", title: "B" },
    });
  });

  it("returns only prev for the last book in explore order", () => {
    expect(exploreBookAdjacentInIndexOrder(sorted, "slug-c")).toEqual({
      prev: { id: "id-slug-b", slug: "slug-b", title: "B" },
      next: undefined,
    });
  });

  it("returns both prev and next in the middle", () => {
    expect(exploreBookAdjacentInIndexOrder(sorted, "slug-b")).toEqual({
      prev: { id: "id-slug-a", slug: "slug-a", title: "A" },
      next: { id: "id-slug-c", slug: "slug-c", title: "C" },
    });
  });

  it("returns empty neighbors for a single-item list", () => {
    const one = booksSortedForExploreIndex([b("only", "Only")]);
    expect(exploreBookAdjacentInIndexOrder(one, "only")).toEqual({
      prev: undefined,
      next: undefined,
    });
  });
});

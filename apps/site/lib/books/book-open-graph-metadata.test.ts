import { describe, expect, it } from "vitest";

import {
  BOOK_OPEN_GRAPH_HEIGHT,
  BOOK_OPEN_GRAPH_WIDTH,
  bookOpenGraphImageFields,
} from "@/lib/books/book-open-graph-metadata";

describe("bookOpenGraphImageFields", () => {
  it("returns undefined when openGraphImage is missing", () => {
    expect(bookOpenGraphImageFields({ title: "Demo" })).toBeUndefined();
  });

  it("returns openGraph and twitter image overrides for a book OG asset", () => {
    const fields = bookOpenGraphImageFields({
      title: "After Certainty",
      openGraphImage: "/generated/open-graph/after-certainty.png",
    });
    expect(fields?.openGraph?.images).toEqual([
      {
        url: "/generated/open-graph/after-certainty.png",
        width: BOOK_OPEN_GRAPH_WIDTH,
        height: BOOK_OPEN_GRAPH_HEIGHT,
        alt: "After Certainty",
      },
    ]);
    expect(fields?.twitter?.images).toEqual(["/generated/open-graph/after-certainty.png"]);
  });
});

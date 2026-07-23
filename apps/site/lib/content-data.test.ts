import { describe, expect, it } from "vitest";

import { getBookDetailHref, getBookBySlug } from "@/lib/content-data";
import { WOLTY_V1_SLUG } from "@/lib/books/book-slugs";

describe("getBookDetailHref", () => {
  it("routes books to explore book detail paths", () => {
    expect(getBookDetailHref("when-others-look-to-you")).toBe(
      "/explore/books/when-others-look-to-you",
    );
    expect(getBookDetailHref(WOLTY_V1_SLUG)).toBe("/explore/books/when-others-look-to-you-v1");
    expect(getBookDetailHref("how-meaning-moves")).toBe("/explore/books/how-meaning-moves");
  });
});

describe("getBookBySlug", () => {
  it("returns a book for WoLTY legacy alias slug when present in semantic manifest", async () => {
    const book = await getBookBySlug(WOLTY_V1_SLUG);
    expect(book?.slug).toBe(WOLTY_V1_SLUG);
    expect(book?.title.length).toBeGreaterThan(0);
  });

  it("returns undefined for unknown slug", async () => {
    expect(await getBookBySlug("no-such-book-slug")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";

import { getBookDetailHref, getBookBySlug } from "@/lib/content-data";

describe("getBookDetailHref", () => {
  it("routes WoLTY to the microsite root", () => {
    expect(getBookDetailHref("when-others-look-to-you")).toBe("/books/when-others-look-to-you");
  });

  it("routes other catalog books to /books/[slug]", () => {
    expect(getBookDetailHref("how-meaning-moves")).toBe("/books/how-meaning-moves");
  });
});

describe("getBookBySlug", () => {
  it("returns a merged catalog entry for WoLTY", () => {
    const book = getBookBySlug("when-others-look-to-you");
    expect(book?.slug).toBe("when-others-look-to-you");
    expect(book?.title.length).toBeGreaterThan(0);
  });

  it("returns undefined for unknown slug", () => {
    expect(getBookBySlug("no-such-book-slug")).toBeUndefined();
  });
});

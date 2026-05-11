import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getBookDetailHref, getBookBySlug } from "@/lib/content-data";

describe("getBookDetailHref", () => {
  it("routes WoLTY public alias to the microsite root", () => {
    expect(getBookDetailHref("when-others-look-to-you")).toBe("/books/when-others-look-to-you");
  });

  it("routes WoLTY v1 slug to the microsite root", () => {
    expect(getBookDetailHref("when-others-look-to-you-v1")).toBe("/books/when-others-look-to-you");
  });

  it("routes WoLTY v2 to the generic book detail path", () => {
    expect(getBookDetailHref("when-others-look-to-you-v2")).toBe("/books/when-others-look-to-you-v2");
  });

  it("routes other catalog books to /books/[slug]", () => {
    expect(getBookDetailHref("how-meaning-moves")).toBe("/books/how-meaning-moves");
  });
});

describe("getBookBySlug", () => {
  let prevOffline: string | undefined;

  beforeEach(() => {
    prevOffline = process.env.BOOKS_MANIFEST_OFFLINE;
    process.env.BOOKS_MANIFEST_OFFLINE = "1";
  });

  afterEach(() => {
    process.env.BOOKS_MANIFEST_OFFLINE = prevOffline;
  });

  it("returns a merged catalog entry for WoLTY legacy slug", async () => {
    const book = await getBookBySlug("when-others-look-to-you");
    expect(book?.slug).toBe("when-others-look-to-you");
    expect(book?.title.length).toBeGreaterThan(0);
  });

  it("returns undefined for unknown slug", async () => {
    expect(await getBookBySlug("no-such-book-slug")).toBeUndefined();
  });
});

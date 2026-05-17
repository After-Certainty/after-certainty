import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getBookDetailHref, getBookBySlug } from "@/lib/content-data";
import { WOLTY_V1_SLUG } from "@/lib/books/generated-manifest";

describe("getBookDetailHref", () => {
  it("routes catalog books to explore book detail paths", () => {
    expect(getBookDetailHref("when-others-look-to-you")).toBe(
      "/explore/books/when-others-look-to-you",
    );
    expect(getBookDetailHref(WOLTY_V1_SLUG)).toBe("/explore/books/when-others-look-to-you-v1");
    expect(getBookDetailHref("how-meaning-moves")).toBe("/explore/books/how-meaning-moves");
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

  it("returns a catalog entry for WoLTY legacy slug", async () => {
    const book = await getBookBySlug("when-others-look-to-you");
    expect(book?.slug).toBe("when-others-look-to-you");
    expect(book?.title.length).toBeGreaterThan(0);
  });

  it("returns undefined for unknown slug", async () => {
    expect(await getBookBySlug("no-such-book-slug")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";

import { isChapterReaderPath } from "@/lib/reading/is-chapter-reader-path";

describe("isChapterReaderPath", () => {
  it("matches chapter reader routes", () => {
    expect(isChapterReaderPath("/explore/books/after-certainty/chapters/intro")).toBe(true);
    expect(
      isChapterReaderPath("/explore/books/after-certainty/chapters/front-matter-introduction/"),
    ).toBe(true);
  });

  it("rejects book detail, shelves, and other explore paths", () => {
    expect(isChapterReaderPath("/explore/books/after-certainty")).toBe(false);
    expect(isChapterReaderPath("/explore/books/shelves/core-works")).toBe(false);
    expect(isChapterReaderPath("/explore/books")).toBe(false);
    expect(isChapterReaderPath("/explore/concepts/agency")).toBe(false);
    expect(isChapterReaderPath(null)).toBe(false);
    expect(isChapterReaderPath(undefined)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { findPublishedQuestionsForBook } from "@/lib/books/related-questions-for-book";

describe("findPublishedQuestionsForBook", () => {
  it("returns published questions keyed to a primary book when present", () => {
    const matches = findPublishedQuestionsForBook("book-after-certainty", 3);
    expect(matches.every((q) => q.primaryBookId === "book-after-certainty")).toBe(true);
    expect(matches.every((q) => q.status === "published")).toBe(true);
  });

  it("returns an empty list for unknown books", () => {
    expect(findPublishedQuestionsForBook("book-does-not-exist")).toEqual([]);
  });
});

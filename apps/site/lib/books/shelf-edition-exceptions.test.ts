import { describe, expect, it } from "vitest";

import {
  getShelfEditionExceptions,
  indexShelfEditionExceptions,
  parseShelfEditionExceptions,
  shelfEditionExceptionKey,
} from "@/lib/books/shelf-edition-exceptions";

describe("shelf-edition-exceptions", () => {
  it("rejects invalid exception files", () => {
    expect(() => parseShelfEditionExceptions({ version: 2, exceptions: [] })).toThrow();
    expect(() =>
      parseShelfEditionExceptions({
        version: 1,
        exceptions: [{ shelfSlug: "Bad_Shelf", bookSlug: "ok", reason: "x" }],
      }),
    ).toThrow();
  });

  it("indexes exceptions by shelf and book slug", () => {
    const byKey = indexShelfEditionExceptions([
      {
        shelfSlug: "leadership-and-authority",
        bookSlug: "when-others-look-to-you-v2",
        reason: "test",
      },
    ]);
    expect(
      byKey.get(shelfEditionExceptionKey("leadership-and-authority", "when-others-look-to-you-v2"))
        ?.reason,
    ).toBe("test");
  });

  it("loads the bundled WoLTY companion shelf exception", () => {
    const entries = getShelfEditionExceptions();
    expect(
      entries.some(
        (e) =>
          e.shelfSlug === "leadership-and-authority" && e.bookSlug === "when-others-look-to-you-v2",
      ),
    ).toBe(true);
  });
});

import { test, fc } from "@fast-check/vitest";
import { expect } from "vitest";

import { prepareSearchQuery } from "@/lib/search/prepareQuery";

const PROP = { seed: 20260919, numRuns: 128 } as const;

/**
 * Stabilization (explicit):
 *
 * 1. Determinism — same input string always yields the same PreparedSearchQuery.
 * 2. Original-form fixpoint — preparing `prepared.original` equals `prepared`
 *    (because `original` is already `query.trim()`).
 * 3. Normalized-form fixpoint — preparing `prepared.searchText` yields the same
 *    `searchText` and `tokens` (the token string is already stopword-filtered /
 *    lowercased / joined; a second pass must not change them).
 */
test.prop([fc.string({ maxLength: 120 })], PROP)(
  "prepareSearchQuery is deterministic and stabilizes on original and searchText",
  (query) => {
    let first: ReturnType<typeof prepareSearchQuery>;
    let second: ReturnType<typeof prepareSearchQuery>;
    expect(() => {
      first = prepareSearchQuery(query);
      second = prepareSearchQuery(query);
    }).not.toThrow();

    expect(second!).toEqual(first!);

    const fromOriginal = prepareSearchQuery(first!.original);
    expect(fromOriginal).toEqual(first!);

    const fromSearchText = prepareSearchQuery(first!.searchText);
    expect(fromSearchText.searchText).toEqual(first!.searchText);
    expect(fromSearchText.tokens).toEqual(first!.tokens);
    expect(fromSearchText.combineWith).toEqual(first!.combineWith);
  },
);

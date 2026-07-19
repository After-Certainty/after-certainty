import { describe, expect, it } from "vitest";

import { prepareSearchQuery } from "@/lib/search/prepareQuery";

describe("prepareSearchQuery", () => {
  it("strips stopwords and uses AND for multi-token queries", () => {
    const prepared = prepareSearchQuery("Why does collaboration fail?");
    expect(prepared.tokens).toEqual(["collaboration", "fail"]);
    expect(prepared.combineWith).toBe("AND");
  });

  it("keeps single-token queries on OR for fuzzy lookup", () => {
    const prepared = prepareSearchQuery("wolty");
    expect(prepared.searchText).toBe("wolty");
    expect(prepared.combineWith).toBe("OR");
  });
});

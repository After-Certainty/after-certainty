import { describe, expect, it } from "vitest";

import { computeSearchBoostWeight } from "@/lib/search/boost";

describe("computeSearchBoostWeight", () => {
  it("ranks published books above draft catalog stubs", () => {
    const published = computeSearchBoostWeight({ entityType: "book", status: "published" });
    const draft = computeSearchBoostWeight({ entityType: "book", status: "draft" });
    const forthcoming = computeSearchBoostWeight({ entityType: "book", status: "forthcoming" });
    expect(published).toBeGreaterThan(forthcoming);
    expect(forthcoming).toBeGreaterThan(draft);
  });

  it("demotes non-canonical editions relative to the canonical sibling", () => {
    const canonical = computeSearchBoostWeight({
      entityType: "book",
      status: "published",
      hasEditionSiblings: true,
      isCanonicalEdition: true,
    });
    const nonCanonical = computeSearchBoostWeight({
      entityType: "book",
      status: "published",
      hasEditionSiblings: true,
      isCanonicalEdition: false,
    });
    expect(canonical).toBeGreaterThan(nonCanonical);
  });

  it("demotes superseded editions further than ordinary non-canonical siblings", () => {
    const companion = computeSearchBoostWeight({
      entityType: "book",
      status: "published",
      hasEditionSiblings: true,
      isCanonicalEdition: false,
    });
    const superseded = computeSearchBoostWeight({
      entityType: "book",
      status: "published",
      hasEditionSiblings: true,
      isCanonicalEdition: false,
      isSuperseded: true,
    });
    expect(companion).toBeGreaterThan(superseded);
  });

  it("applies type base weights", () => {
    expect(computeSearchBoostWeight({ entityType: "concept" })).toBeGreaterThan(
      computeSearchBoostWeight({ entityType: "source" }),
    );
  });
});

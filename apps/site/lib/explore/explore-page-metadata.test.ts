import { describe, expect, it } from "vitest";

import {
  buildExplorePageMetadata,
  exploreHasUiStateParams,
  resolveExploreCanonicalPath,
} from "@/lib/explore/explore-page-metadata";

describe("exploreHasUiStateParams", () => {
  it("is false for bare /explore", () => {
    expect(exploreHasUiStateParams({})).toBe(false);
  });

  it("is true for focus, view, pathway, and edge params", () => {
    expect(
      exploreHasUiStateParams({
        focusKind: "concept",
        focusSlug: "correction",
        view: "observatory",
      }),
    ).toBe(true);
    expect(exploreHasUiStateParams({ view: "observatory" })).toBe(true);
    expect(exploreHasUiStateParams({ pathwayKind: "trail", pathwaySlug: "x" })).toBe(true);
    expect(exploreHasUiStateParams({ edge: "a→b" })).toBe(true);
    expect(exploreHasUiStateParams({ relPreset: "tensions" })).toBe(true);
  });
});

describe("resolveExploreCanonicalPath", () => {
  it("maps focus to entity path", () => {
    expect(
      resolveExploreCanonicalPath({
        focusKind: "concept",
        focusSlug: "correction",
        view: "observatory",
      }),
    ).toBe("/explore/concepts/correction");
  });

  it("falls back to /explore without valid focus", () => {
    expect(resolveExploreCanonicalPath({ view: "observatory" })).toBe("/explore");
    expect(resolveExploreCanonicalPath({ focusKind: "nope", focusSlug: "x" })).toBe("/explore");
  });
});

describe("buildExplorePageMetadata", () => {
  it("indexes the bare hub with self-canonical", () => {
    const m = buildExplorePageMetadata({});
    expect(m.robots).toEqual({ index: true, follow: true });
    expect(m.alternates?.canonical).toBe("/explore");
  });

  it("noindexes observatory UI state and canonicalizes to the entity", () => {
    const m = buildExplorePageMetadata({
      focusKind: "concept",
      focusSlug: "correction",
      view: "observatory",
    });
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.alternates?.canonical).toBe("/explore/concepts/correction");
  });
});

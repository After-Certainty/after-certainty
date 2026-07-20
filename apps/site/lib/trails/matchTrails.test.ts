import { describe, expect, it } from "vitest";

import trailsManifest from "@/data/trails-manifest.json";
import { matchTrailsForSearchQuery } from "@/lib/trails/enrichTrails";
import { parseTrailsManifest } from "@/lib/trails/schema";

describe("matchTrailsForSearchQuery", () => {
  it("matches reading trail phrasing to curated trail", () => {
    const manifest = parseTrailsManifest(trailsManifest);
    const matched = matchTrailsForSearchQuery("reading trail judgment", manifest, 2);
    expect(matched.some((t) => t.id === "judgment-before-certainty")).toBe(true);
  });

  it("matches software engineer phrasing to practitioner trail", () => {
    const manifest = parseTrailsManifest(trailsManifest);
    const matched = matchTrailsForSearchQuery("software engineers", manifest, 2);
    expect(matched.some((t) => t.id === "software-judgment-trail")).toBe(true);
  });

  it("returns empty for blank query", () => {
    const manifest = parseTrailsManifest(trailsManifest);
    expect(matchTrailsForSearchQuery("  ", manifest, 2)).toEqual([]);
  });
});

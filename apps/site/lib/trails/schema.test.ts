import { describe, expect, it } from "vitest";

import { getTrailsManifest } from "@/lib/trails/loadTrails";
import { parseTrailsManifest } from "@/lib/trails/schema";

describe("trails schema", () => {
  it("loads trails from the bundled semantic manifest", () => {
    const parsed = getTrailsManifest();
    expect(parsed.manifestVersion).toBe(1);
    expect(parsed.trails.length).toBeGreaterThanOrEqual(6);
    expect(parsed.searchBridges?.length).toBeGreaterThan(0);
  });

  it("requires id and slug to match", () => {
    expect(() =>
      parseTrailsManifest({
        manifestVersion: 1,
        trails: [
          {
            id: "a",
            slug: "b",
            title: "A",
            summary: "Summary",
            orientation: "Orientation",
            status: "draft",
            themes: ["Test"],
            pathStops: [
              { position: 1, entityType: "concept", entityId: "concept-trust", description: "d" },
              { position: 2, entityType: "concept", entityId: "concept-bias", description: "d2" },
              {
                position: 3,
                entityType: "concept",
                entityId: "concept-meaning",
                description: "d3",
              },
            ],
            closingReflection: "Close",
          },
        ],
      }),
    ).toThrow();
  });
});

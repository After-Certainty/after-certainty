import { describe, expect, it } from "vitest";

import { parseTrailsManifest } from "@/lib/trails/schema";
import trailsManifest from "@/data/trails-manifest.json";

describe("trails schema", () => {
  it("parses bundled manifest", () => {
    const parsed = parseTrailsManifest(trailsManifest);
    expect(parsed.manifestVersion).toBe(1);
    expect(parsed.trails.length).toBe(5);
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

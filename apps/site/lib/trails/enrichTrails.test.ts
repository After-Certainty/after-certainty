import semanticManifest from "@/data/semantic-manifest.json";
import podcastEpisodes from "@/data/podcast-episodes.json";
import { buildGraphIndex } from "@/lib/graph/graph";
import { enrichStop, defaultMinutesForType } from "@/lib/paths/enrichStop";
import { getTrailsManifest } from "@/lib/trails/loadTrails";
import { enrichTrail } from "@/lib/trails/enrichTrails";
import type { SemanticGraph } from "@/types/semanticGraph";
import { describe, expect, it } from "vitest";

describe("enrichStop", () => {
  it("assigns default minutes by entity type", () => {
    expect(defaultMinutesForType("book")).toBe(25);
    expect(defaultMinutesForType("concept")).toBe(5);
    expect(defaultMinutesForType("unknown")).toBe(8);
  });

  it("resolves book stops to canonical explore href", () => {
    const graph = semanticManifest as SemanticGraph;
    const index = buildGraphIndex(graph);
    const stop = enrichStop(
      {
        position: 1,
        entityType: "book",
        entityId: "book-coupling",
        description: "Test",
      },
      index,
      graph.books,
      podcastEpisodes.episodes,
    );

    expect(stop.href).toBe("/explore/books/coupling");
    expect(stop.title).toBeTruthy();
    expect(stop.external).toBe(false);
  });
});

describe("enrichTrail", () => {
  it("aggregates estimated minutes and enriches all stops", () => {
    const graph = semanticManifest as SemanticGraph;
    const manifest = getTrailsManifest();
    const trail = manifest.trails.find((t) => t.slug === "meaning-under-pressure");
    expect(trail).toBeDefined();

    const enriched = enrichTrail(trail!, graph, podcastEpisodes.episodes);

    expect(enriched.pathStopsEnriched.length).toBe(trail!.pathStops.length);
    expect(enriched.totalEstimatedMinutes).toBeGreaterThan(0);
    expect(enriched.pathStopsEnriched.every((s) => s.href.startsWith("/") || s.external)).toBe(
      true,
    );
  });
});

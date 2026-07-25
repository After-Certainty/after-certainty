import podcastEpisodes from "@/data/podcast-episodes.json";
import { buildGraphIndex } from "@/lib/graph/graph";
import { enrichStop, defaultMinutesForType } from "@/lib/paths/enrichStop";
import { getTrailsManifest } from "@/lib/trails/loadTrails";
import { enrichTrail } from "@/lib/trails/enrichTrails";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import { describe, expect, it } from "vitest";

const graph = loadManifestFixture("questions-and-trails");

describe("enrichStop", () => {
  it("assigns default minutes by entity type", () => {
    expect(defaultMinutesForType("book")).toBe(25);
    expect(defaultMinutesForType("concept")).toBe(5);
    expect(defaultMinutesForType("unknown")).toBe(8);
  });

  it("resolves book stops to canonical explore href", () => {
    const index = buildGraphIndex(graph);
    const stop = enrichStop(
      {
        position: 1,
        entityType: "book",
        entityId: "book-after-certainty",
        description: "Test",
      },
      index,
      graph.books,
      podcastEpisodes.episodes,
    );

    expect(stop.href).toBe("/explore/books/after-certainty");
    expect(stop.title).toBeTruthy();
    expect(stop.external).toBe(false);
  });

  it("resolves chapter stops to reader routeKey", () => {
    const index = buildGraphIndex(graph);
    const chapter = {
      id: "chapter-after-certainty-front-matter-introduction",
      workId: "work-after-certainty",
      editionId: "book-after-certainty",
      title: "Introduction",
      position: 1,
      kind: "introduction" as const,
      sourcePath: "front-matter/introduction.md",
      wordCount: 1200,
      estimatedReadingMinutes: 6,
      public: true,
      routeKey: "/explore/books/after-certainty/chapters/front-matter-introduction",
    };

    const stop = enrichStop(
      {
        position: 1,
        entityType: "chapter",
        entityId: chapter.id,
        description: "Chapter stop",
      },
      index,
      graph.books,
      podcastEpisodes.episodes,
      [chapter],
    );

    expect(stop.href).toBe(chapter.routeKey);
    expect(stop.title).toBe("Introduction");
    expect(stop.entityTypeLabel).toBe("Chapter");
    expect(stop.estimatedMinutes).toBe(6);
    expect(stop.external).toBe(false);
  });
});

describe("enrichTrail", () => {
  it("aggregates estimated minutes and enriches all stops", () => {
    const manifest = getTrailsManifest(graph);
    const trail = manifest.trails.find((t) => t.slug === "judgment-before-certainty");
    expect(trail).toBeDefined();

    const enriched = enrichTrail(trail!, graph, podcastEpisodes.episodes);

    expect(enriched.pathStopsEnriched.length).toBe(trail!.pathStops.length);
    expect(enriched.totalEstimatedMinutes).toBeGreaterThan(0);
    expect(enriched.pathStopsEnriched.every((s) => s.href.startsWith("/") || s.external)).toBe(
      true,
    );
  });
});

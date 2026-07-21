import semanticManifest from "@/data/semantic-manifest.json";
import podcastEpisodes from "@/data/podcast-episodes.json";
import trailsManifest from "@/data/trails-manifest.json";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { parseTrailsManifest } from "@/lib/trails/schema";
import { assertTrailsManifestHealthy, collectTrailHealthReport } from "@/lib/trails/validate";
import type { SemanticGraph } from "@/types/semanticGraph";
import { describe, expect, it } from "vitest";

describe("trails manifest health", () => {
  it("passes validation against bundled semantic graph", async () => {
    const manifest = parseTrailsManifest(trailsManifest);
    const graph = (await getSemanticGraph()) as SemanticGraph;

    expect(() =>
      assertTrailsManifestHealthy({
        manifest,
        graph,
        podcastEpisodes: podcastEpisodes.episodes,
      }),
    ).not.toThrow();
  });

  it("has five published trails with featured entries and at least one upcoming", () => {
    const manifest = parseTrailsManifest(trailsManifest);
    const published = manifest.trails.filter((t) => t.status === "published");
    const upcoming = manifest.trails.filter((t) => t.status === "upcoming");
    const featured = published.filter((t) => t.featured);
    expect(published).toHaveLength(5);
    expect(upcoming.length).toBeGreaterThanOrEqual(1);
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });

  it("reports no errors on bundled fallback data", () => {
    const manifest = parseTrailsManifest(trailsManifest);
    const report = collectTrailHealthReport({
      manifest,
      graph: semanticManifest as SemanticGraph,
      podcastEpisodes: podcastEpisodes.episodes,
    });
    expect(report.errors).toEqual([]);
  });
});

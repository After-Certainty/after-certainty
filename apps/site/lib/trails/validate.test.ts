import semanticManifest from "@/data/semantic-manifest.json";
import booksManifest from "@/data/books-manifest.json";
import podcastEpisodes from "@/data/podcast-episodes.json";
import trailsManifest from "@/data/trails-manifest.json";
import { getBooksCatalogCached } from "@/lib/books/manifest";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { parseTrailsManifest } from "@/lib/trails/schema";
import { assertTrailsManifestHealthy, collectTrailHealthReport } from "@/lib/trails/validate";
import type { SemanticGraph } from "@/types/semanticGraph";
import { describe, expect, it } from "vitest";

describe("trails manifest health", () => {
  it("passes validation against bundled semantic graph and catalog", async () => {
    const manifest = parseTrailsManifest(trailsManifest);
    const graph = (await getSemanticGraph()) as SemanticGraph;
    const catalog = await getBooksCatalogCached();

    expect(() =>
      assertTrailsManifestHealthy({
        manifest,
        graph,
        catalogBooks: catalog.books,
        podcastEpisodes: podcastEpisodes.episodes,
      }),
    ).not.toThrow();
  });

  it("has five published trails with featured entries", () => {
    const manifest = parseTrailsManifest(trailsManifest);
    const published = manifest.trails.filter((t) => t.status === "published");
    const featured = published.filter((t) => t.featured);
    expect(published).toHaveLength(5);
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });

  it("reports no errors on bundled fallback data", () => {
    const manifest = parseTrailsManifest(trailsManifest);
    const report = collectTrailHealthReport({
      manifest,
      graph: semanticManifest as SemanticGraph,
      catalogBooks: booksManifest.books,
      podcastEpisodes: podcastEpisodes.episodes,
    });
    expect(report.errors).toEqual([]);
  });
});

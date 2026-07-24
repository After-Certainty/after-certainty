import podcastEpisodes from "@/data/podcast-episodes.json";
import { getTrailsManifest } from "@/lib/trails/loadTrails";
import { assertTrailsManifestHealthy, collectTrailHealthReport } from "@/lib/trails/validate";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";
import { describe, expect, it } from "vitest";

const fixture = loadManifestFixture("questions-and-trails");
const localGraph = tryLoadLocalSemanticManifest();

describe("trails manifest (questions-and-trails fixture)", () => {
  it("exposes published trails with featured entries", () => {
    const manifest = getTrailsManifest(fixture);
    const published = manifest.trails.filter((t) => t.status === "published");
    const featured = published.filter((t) => t.featured);
    expect(published.length).toBeGreaterThanOrEqual(3);
    expect(featured.length).toBeGreaterThanOrEqual(1);
    expect(manifest.trails.some((t) => t.slug === "judgment-before-certainty")).toBe(true);
  });
});

describe.skipIf(!localGraph)("trails manifest health (local manifest)", () => {
  it("passes validation against the local semantic graph", () => {
    const manifest = getTrailsManifest(localGraph!);

    expect(() =>
      assertTrailsManifestHealthy({
        manifest,
        graph: localGraph!,
        podcastEpisodes: podcastEpisodes.episodes,
      }),
    ).not.toThrow();
  });

  it("has published trails with featured entries and at least one upcoming", () => {
    const manifest = getTrailsManifest(localGraph!);
    const published = manifest.trails.filter((t) => t.status === "published");
    const upcoming = manifest.trails.filter((t) => t.status === "upcoming");
    const featured = published.filter((t) => t.featured);
    expect(published.length).toBeGreaterThanOrEqual(5);
    expect(upcoming.length).toBeGreaterThanOrEqual(1);
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });

  it("reports no errors on local manifest data", () => {
    const manifest = getTrailsManifest(localGraph!);
    const report = collectTrailHealthReport({
      manifest,
      graph: localGraph!,
      podcastEpisodes: podcastEpisodes.episodes,
    });
    expect(report.errors).toEqual([]);
  });
});

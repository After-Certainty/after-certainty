import semanticManifest from "@/data/semantic-manifest.json";
import podcastEpisodes from "@/data/podcast-episodes.json";
import { describe, expect, it } from "vitest";

import { buildPublicCorpusRegistry } from "@/lib/corpus/public-registry";
import {
  assertPublicCorpusHealthy,
  collectPublicCorpusIntegrityIssues,
} from "@/lib/corpus/validate-public-corpus";
import { validateSemanticGraph } from "@/lib/graph/validate";
import type { SemanticGraph } from "@/types/semanticGraph";

const validated = validateSemanticGraph(semanticManifest as unknown);
if (!validated.success) {
  throw new Error("Bundled semantic-manifest.json failed validation in corpus tests");
}
const graph = validated.data;
const episodes = podcastEpisodes.episodes;

describe("public corpus registry", () => {
  it("lists Boundary Conditions as fiction and Observer Patterns as poetry", () => {
    const registry = buildPublicCorpusRegistry(graph);
    const boundary = registry.books.find((b) => b.slug === "boundary-conditions");
    const observer = registry.books.find((b) => b.slug === "observer-patterns");
    expect(boundary?.contentType).toBe("fiction");
    expect(observer?.contentType).toBe("poetry");
    expect(registry.catalogContentTypeByBookId.get(boundary!.id)).toBe("fiction");
    expect(registry.searchContentTypeByBookId.get(observer!.id)).toBe("poetry");
  });
});

describe("public corpus integrity", () => {
  it("passes for the bundled production manifest", () => {
    const report = assertPublicCorpusHealthy(graph, { podcastEpisodes: episodes });
    expect(report.errors).toEqual([]);
  }, 30_000);

  it("drops demoted trails from the public registry trails collection", () => {
    const published = (graph.trails ?? []).filter((t) => t.status === "published");
    expect(published.length).toBeGreaterThan(0);
    const demotedId = published[0]!.id;
    const broken: SemanticGraph = {
      ...graph,
      trails: (graph.trails ?? []).map((trail) =>
        trail.id === demotedId ? { ...trail, status: "draft" as const } : trail,
      ),
    };
    const report = collectPublicCorpusIntegrityIssues(broken, {
      podcastEpisodes: episodes,
    });
    expect(report.registry.trails.some((t) => t.id === demotedId)).toBe(false);
    expect(report.registry.trails.length).toBe(published.length - 1);
  }, 30_000);
});

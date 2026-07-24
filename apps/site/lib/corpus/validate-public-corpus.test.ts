import podcastEpisodes from "@/data/podcast-episodes.json";
import { describe, expect, it } from "vitest";

import { buildPublicCorpusRegistry } from "@/lib/corpus/public-registry";
import {
  assertPublicCorpusHealthy,
  collectPublicCorpusIntegrityIssues,
} from "@/lib/corpus/validate-public-corpus";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph = tryLoadLocalSemanticManifest();
const episodes = podcastEpisodes.episodes;

describe.skipIf(!graph)("public corpus registry (local manifest)", () => {
  it("lists Boundary Conditions as fiction and Observer Patterns as poetry", () => {
    const registry = buildPublicCorpusRegistry(graph!);
    const boundary = registry.books.find((b) => b.slug === "boundary-conditions");
    const observer = registry.books.find((b) => b.slug === "observer-patterns");
    expect(boundary?.contentType).toBe("fiction");
    expect(observer?.contentType).toBe("poetry");
    expect(registry.catalogContentTypeByBookId.get(boundary!.id)).toBe("fiction");
    expect(registry.searchContentTypeByBookId.get(observer!.id)).toBe("poetry");
  });

  it("retains schema 2.2 chapters as unlisted discovery metadata", () => {
    const registry = buildPublicCorpusRegistry(graph!);
    expect(registry.chapters.length).toBeGreaterThan(0);
    expect(registry.chapterIdsByEditionId.get("book-after-certainty")?.length).toBeGreaterThan(0);
    expect(registry.partIdsByEditionId.get("book-after-certainty")?.length).toBeGreaterThan(0);
    expect(registry.chapters.every((c) => c.visibility === "unlisted")).toBe(true);
    expect(registry.chapters.every((c) => !c.searchEligible && !c.sitemapEligible)).toBe(true);
    expect(registry.sitemapPaths.some((path) => path.includes("/chapters/"))).toBe(false);
  });
});

describe.skipIf(!graph)("public corpus integrity (local manifest)", () => {
  it("passes for the generated local manifest", () => {
    const report = assertPublicCorpusHealthy(graph!, { podcastEpisodes: episodes });
    expect(report.errors).toEqual([]);
  }, 30_000);

  it("drops demoted trails from the public registry trails collection", () => {
    const published = (graph!.trails ?? []).filter((t) => t.status === "published");
    expect(published.length).toBeGreaterThan(0);
    const demotedId = published[0]!.id;
    const broken: SemanticGraph = {
      ...graph!,
      trails: (graph!.trails ?? []).map((trail) =>
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

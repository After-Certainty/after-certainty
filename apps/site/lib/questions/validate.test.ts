import semanticManifest from "@/data/semantic-manifest.json";
import podcastEpisodes from "@/data/podcast-episodes.json";
import { getQuestionsManifest } from "@/lib/questions/loadQuestions";
import {
  assertQuestionsManifestHealthy,
  collectQuestionHealthReport,
} from "@/lib/questions/validate";
import { getSemanticGraph } from "@/lib/graph/manifest";
import type { SemanticGraph } from "@/types/semanticGraph";
import { describe, expect, it } from "vitest";

describe("questions manifest health", () => {
  it("passes validation against bundled semantic graph", async () => {
    const manifest = getQuestionsManifest();
    const graph = await getSemanticGraph();

    expect(() =>
      assertQuestionsManifestHealthy({
        manifest,
        graph,
        podcastEpisodes: podcastEpisodes.episodes,
      }),
    ).not.toThrow();
  });

  it("has published questions with 3+ featured", () => {
    const manifest = getQuestionsManifest();
    const published = manifest.questions.filter((q) => q.status === "published");
    const featured = published.filter((q) => q.featured);
    expect(published.length).toBeGreaterThanOrEqual(12);
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });

  it("reports no errors on bundled fallback data", () => {
    const manifest = getQuestionsManifest();
    const report = collectQuestionHealthReport({
      manifest,
      graph: semanticManifest as unknown as SemanticGraph,
      podcastEpisodes: podcastEpisodes.episodes,
    });
    expect(report.errors).toEqual([]);
  });
});

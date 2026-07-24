import podcastEpisodes from "@/data/podcast-episodes.json";
import { getQuestionsManifest } from "@/lib/questions/loadQuestions";
import {
  assertQuestionsManifestHealthy,
  collectQuestionHealthReport,
} from "@/lib/questions/validate";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";
import { describe, expect, it } from "vitest";

const graph = tryLoadLocalSemanticManifest();

describe.skipIf(!graph)("questions manifest health (local manifest)", () => {
  it("passes validation against the local semantic graph", () => {
    const manifest = getQuestionsManifest(graph!);

    expect(() =>
      assertQuestionsManifestHealthy({
        manifest,
        graph: graph!,
        podcastEpisodes: podcastEpisodes.episodes,
      }),
    ).not.toThrow();
  });

  it("has published questions with 3+ featured", () => {
    const manifest = getQuestionsManifest(graph!);
    const published = manifest.questions.filter((q) => q.status === "published");
    const featured = published.filter((q) => q.featured);
    expect(published.length).toBeGreaterThanOrEqual(12);
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });

  it("reports no errors on local manifest data", () => {
    const manifest = getQuestionsManifest(graph!);
    const report = collectQuestionHealthReport({
      manifest,
      graph: graph!,
      podcastEpisodes: podcastEpisodes.episodes,
    });
    expect(report.errors).toEqual([]);
  });
});

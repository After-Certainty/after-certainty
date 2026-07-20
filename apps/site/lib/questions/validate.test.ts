import semanticManifest from "@/data/semantic-manifest.json";
import booksManifest from "@/data/books-manifest.json";
import podcastEpisodes from "@/data/podcast-episodes.json";
import { getBooksCatalogCached } from "@/lib/books/manifest";
import { parseQuestionsManifest } from "@/lib/questions/schema";
import {
  assertQuestionsManifestHealthy,
  collectQuestionHealthReport,
} from "@/lib/questions/validate";
import { getSemanticGraph } from "@/lib/graph/manifest";
import type { SemanticGraph } from "@/types/semanticGraph";
import questionsManifest from "@/data/questions-manifest.json";
import { describe, expect, it } from "vitest";

describe("questions manifest health", () => {
  it("passes validation against bundled semantic graph and catalog", async () => {
    const manifest = parseQuestionsManifest(questionsManifest);
    const graph = (await getSemanticGraph()) as SemanticGraph;
    const catalog = await getBooksCatalogCached();

    expect(() =>
      assertQuestionsManifestHealthy({
        manifest,
        graph,
        catalogBooks: catalog.books,
        podcastEpisodes: podcastEpisodes.episodes,
      }),
    ).not.toThrow();
  });

  it("has 12 published questions with 3+ featured", () => {
    const manifest = parseQuestionsManifest(questionsManifest);
    const published = manifest.questions.filter((q) => q.status === "published");
    const featured = published.filter((q) => q.featured);
    expect(published).toHaveLength(12);
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });

  it("reports no errors on bundled fallback data", () => {
    const manifest = parseQuestionsManifest(questionsManifest);
    const report = collectQuestionHealthReport({
      manifest,
      graph: semanticManifest as SemanticGraph,
      catalogBooks: booksManifest.books,
      podcastEpisodes: podcastEpisodes.episodes,
    });
    expect(report.errors).toEqual([]);
  });
});

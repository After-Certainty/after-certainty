import podcastEpisodes from "@/data/podcast-episodes.json";
import semanticManifest from "@/data/semantic-manifest.json";
import questionsManifest from "@/data/questions-manifest.json";
import { WOLTY_V1_SLUG } from "@/lib/books/book-slugs";
import { enrichQuestion } from "@/lib/questions/enrichQuestions";
import { parseQuestionsManifest } from "@/lib/questions/schema";
import type { SemanticGraph } from "@/types/semanticGraph";
import { describe, expect, it } from "vitest";

describe("enrichQuestions", () => {
  const graph = semanticManifest as SemanticGraph;

  it("resolves WoLTY alias book slug to canonical v1 href", () => {
    const manifest = parseQuestionsManifest(questionsManifest);
    const question = manifest.questions.find((q) => q.id === "someone-begins-looking-to-you");
    expect(question).toBeDefined();
    const enriched = enrichQuestion(question!, graph, podcastEpisodes.episodes);
    const bookStop = enriched.pathStopsEnriched.find((s) => s.entityType === "book");
    expect(bookStop?.href).toContain(WOLTY_V1_SLUG);
  });

  it("enriches mixed-media meaning question with podcast external link", () => {
    const manifest = parseQuestionsManifest(questionsManifest);
    const question = manifest.questions.find((q) => q.id === "meaning-changes-as-it-travels");
    expect(question).toBeDefined();
    const enriched = enrichQuestion(question!, graph, podcastEpisodes.episodes);
    const podcastStop = enriched.pathStopsEnriched.find((s) => s.entityType === "podcast_episode");
    expect(podcastStop?.external).toBe(true);
    expect(podcastStop?.href).toMatch(/^https?:\/\//);
  });
});

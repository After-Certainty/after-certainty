import podcastEpisodes from "@/data/podcast-episodes.json";
import { WOLTY_V1_SLUG } from "@/lib/books/book-slugs";
import { enrichQuestion } from "@/lib/questions/enrichQuestions";
import { getQuestionsManifest } from "@/lib/questions/loadQuestions";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";
import type { QuestionDefinition } from "@/types/questions";
import { describe, expect, it } from "vitest";

const fixture = loadManifestFixture("questions-and-trails");
const localGraph = tryLoadLocalSemanticManifest();

describe.skipIf(!localGraph)("enrichQuestions (local manifest)", () => {
  it("resolves WoLTY alias book slug to canonical v1 href", () => {
    const manifest = getQuestionsManifest(localGraph!);
    const question = manifest.questions.find((q) => q.id === "someone-begins-looking-to-you");
    expect(question).toBeDefined();
    const enriched = enrichQuestion(question!, localGraph!, podcastEpisodes.episodes);
    const bookStop = enriched.pathStopsEnriched.find((s) => s.entityType === "book");
    expect(bookStop?.href).toContain(WOLTY_V1_SLUG);
  });

  it("enriches mixed-media meaning question with podcast external link", () => {
    const manifest = getQuestionsManifest(localGraph!);
    const question = manifest.questions.find((q) => q.id === "meaning-changes-as-it-travels");
    expect(question).toBeDefined();
    const enriched = enrichQuestion(question!, localGraph!, podcastEpisodes.episodes);
    const podcastStop = enriched.pathStopsEnriched.find((s) => s.entityType === "podcast_episode");
    expect(podcastStop?.external).toBe(true);
    expect(podcastStop?.href).toMatch(/^https?:\/\//);
  });
});

describe("enrichQuestions (questions-and-trails fixture)", () => {
  it("enriches a synthetic podcast stop against the fixture graph", () => {
    const episode = podcastEpisodes.episodes[0];
    expect(episode).toBeDefined();
    const question: QuestionDefinition = {
      id: "fixture-podcast-path",
      slug: "fixture-podcast-path",
      question: "How does meaning change as it travels?",
      summary: "Fixture question for podcast stop enrichment.",
      orientation: "Orientation",
      whatThisIsNot: ["not a transcript"],
      status: "published",
      families: ["Meaning"],
      primaryBookId: "book-after-certainty",
      pathStops: [
        {
          position: 1,
          entityType: "book",
          entityId: "book-after-certainty",
          description: "Start on the page.",
        },
        {
          position: 2,
          entityType: "podcast_episode",
          entityId: episode!.id,
          description: "Then listen.",
        },
        {
          position: 3,
          entityType: "book",
          entityId: "book-observer-patterns",
          description: "Return to observation.",
        },
      ],
      closingReflection: "Meaning moves.",
    };
    const enriched = enrichQuestion(question, fixture, podcastEpisodes.episodes);
    const podcastStop = enriched.pathStopsEnriched.find((s) => s.entityType === "podcast_episode");
    expect(podcastStop?.external).toBe(true);
    expect(podcastStop?.href).toMatch(/^https?:\/\//);
  });
});

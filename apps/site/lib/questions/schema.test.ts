import { describe, expect, it } from "vitest";

import { getQuestionsManifest } from "@/lib/questions/loadQuestions";
import { parseQuestionsManifest } from "@/lib/questions/schema";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";

const fixture = loadManifestFixture("questions-and-trails");
const localGraph = tryLoadLocalSemanticManifest();

describe("questions manifest schema", () => {
  it("loads questions from the questions-and-trails fixture", () => {
    const parsed = getQuestionsManifest(fixture);
    expect(parsed.manifestVersion).toBe(1);
    expect(parsed.questions.length).toBeGreaterThan(0);
    expect(parsed.searchBridges?.length).toBeGreaterThan(0);
  });

  it.skipIf(!localGraph)("loads questions from the installed local manifest", () => {
    const parsed = getQuestionsManifest(localGraph!);
    expect(parsed.questions.length).toBeGreaterThanOrEqual(12);
  });

  it("requires id and slug to match", () => {
    expect(() =>
      parseQuestionsManifest({
        manifestVersion: 1,
        questions: [
          {
            id: "a",
            slug: "b",
            question: "Q?",
            summary: "S",
            orientation: "O",
            whatThisIsNot: ["not x"],
            status: "draft",
            families: ["Test"],
            primaryBookId: "book-after-certainty",
            pathStops: [
              { position: 1, entityType: "concept", entityId: "concept-trust", description: "d" },
              { position: 2, entityType: "concept", entityId: "concept-bias", description: "d" },
              {
                position: 3,
                entityType: "book",
                entityId: "book-after-certainty",
                description: "d",
              },
            ],
            closingReflection: "c",
          },
        ],
      }),
    ).toThrow();
  });
});

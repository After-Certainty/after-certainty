import { describe, expect, it } from "vitest";

import { getQuestionsManifest } from "@/lib/questions/loadQuestions";
import { parseQuestionsManifest } from "@/lib/questions/schema";

describe("questions manifest schema", () => {
  it("loads questions from the bundled semantic manifest", () => {
    const parsed = getQuestionsManifest();
    expect(parsed.manifestVersion).toBe(1);
    expect(parsed.questions.length).toBeGreaterThan(0);
    expect(parsed.searchBridges?.length).toBeGreaterThan(0);
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

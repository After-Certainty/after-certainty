import { describe, expect, it } from "vitest";

import questionsManifest from "@/data/questions-manifest.json";
import { matchQuestionsForSearchQuery } from "@/lib/questions/enrichQuestions";
import { parseQuestionsManifest } from "@/lib/questions/schema";

describe("matchQuestionsForSearchQuery", () => {
  it("matches trust disagreement phrasing to curated question", () => {
    const manifest = parseQuestionsManifest(questionsManifest);
    const matched = matchQuestionsForSearchQuery("trust and disagreement", manifest, 2);
    expect(matched.some((q) => q.id === "trust-survives-disagreement")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { matchQuestionsForSearchQuery } from "@/lib/questions/enrichQuestions";
import { getQuestionsManifest } from "@/lib/questions/loadQuestions";

describe("matchQuestionsForSearchQuery", () => {
  it("matches trust disagreement phrasing to curated question", () => {
    const manifest = getQuestionsManifest();
    const matched = matchQuestionsForSearchQuery("trust and disagreement", manifest, 2);
    expect(matched.some((q) => q.id === "trust-survives-disagreement")).toBe(true);
  });
});

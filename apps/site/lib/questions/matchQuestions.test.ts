import { describe, expect, it } from "vitest";

import { matchQuestionsForSearchQuery } from "@/lib/questions/enrichQuestions";
import { getQuestionsManifest } from "@/lib/questions/loadQuestions";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";

const graph = tryLoadLocalSemanticManifest();

describe.skipIf(!graph)("matchQuestionsForSearchQuery (local manifest)", () => {
  it("matches trust disagreement phrasing to curated question", () => {
    const manifest = getQuestionsManifest(graph!);
    const matched = matchQuestionsForSearchQuery("trust and disagreement", manifest, 2);
    expect(matched.some((q) => q.id === "trust-survives-disagreement")).toBe(true);
  });
});

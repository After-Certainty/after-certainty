import { describe, expect, it } from "vitest";

import { parseSearchAliasConfig } from "@/lib/search/aliases";
import { explainSearchMatch } from "@/lib/search/explanations";
import type { SearchDocument } from "@/lib/search/types";

function doc(
  partial: Partial<SearchDocument> & Pick<SearchDocument, "id" | "title">,
): SearchDocument {
  return {
    entityType: "pattern",
    slug: partial.slug ?? partial.id,
    resultLabel: "Pattern",
    canonicalUrl: "/explore/patterns/x",
    visibility: "listed",
    searchText: partial.title,
    aliases: [],
    boostWeight: 1,
    sourceArtifact: "semantic",
    ...partial,
  };
}

describe("explainSearchMatch", () => {
  it("labels related bridges without calling them aliases", () => {
    const aliasConfig = parseSearchAliasConfig({
      version: 1,
      entries: [
        {
          terms: ["trust and disagreement"],
          kind: "related",
          targetIds: ["pattern-disagreement-is-suppressed"],
        },
      ],
    });

    const labels = explainSearchMatch(
      "trust and disagreement",
      doc({
        id: "pattern-disagreement-is-suppressed",
        title: "Disagreement is Suppressed",
        description: "Dissent fades until it no longer challenges decisions.",
      }),
      { aliasConfig },
    );

    expect(labels).toContain("Related to “trust and disagreement”");
    expect(labels.some((l) => l.startsWith("Also known as"))).toBe(false);
  });

  it("surfaces definition mentions for concept descriptions", () => {
    const labels = explainSearchMatch(
      "personally verify",
      doc({
        id: "concept-trust",
        entityType: "concept",
        title: "Trust",
        resultLabel: "Concept",
        description:
          "Trust is the extension of action beyond what one person can personally verify.",
      }),
    );
    expect(labels).toContain("Definition mentions your terms");
  });
});

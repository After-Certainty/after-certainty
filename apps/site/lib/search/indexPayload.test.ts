import { describe, expect, it } from "vitest";

import {
  buildSearchIndexPayload,
  toSearchIndexWireDocument,
} from "@/lib/search/indexPayload";
import type { SearchDocument } from "@/lib/search/types";

function doc(partial: Partial<SearchDocument> & Pick<SearchDocument, "id" | "title">): SearchDocument {
  return {
    entityType: "concept",
    slug: partial.slug ?? partial.id,
    resultLabel: "Concept",
    canonicalUrl: `/explore/concepts/${partial.slug ?? partial.id}`,
    visibility: "listed",
    searchText: partial.searchText ?? partial.title,
    aliases: [],
    boostWeight: 1.2,
    sourceArtifact: "semantic",
    ...partial,
  };
}

describe("toSearchIndexWireDocument", () => {
  it("omits unused id arrays and content-type metadata", () => {
    const wire = toSearchIndexWireDocument(
      doc({
        id: "concept-certainty",
        title: "Certainty",
        description: "A posture of knowing.",
        searchText: "Certainty\ncertainty\nA posture of knowing.\nRecognition signal prose here.",
        conceptIds: ["concept-trust"],
        patternIds: ["pattern-x"],
        contentType: "nonfiction",
        contentTypeLabel: "Nonfiction",
        publicationDate: "2026",
        sourceArtifact: "semantic",
      }),
    );

    expect(wire.conceptIds).toBeUndefined();
    expect(wire.patternIds).toBeUndefined();
    expect(wire.contentType).toBeUndefined();
    expect(wire.contentTypeLabel).toBeUndefined();
    expect(wire.publicationDate).toBeUndefined();
    expect(wire.searchText).toBe("Recognition signal prose here.");
    expect(wire.description).toBe("A posture of knowing.");
  });

  it("keeps bookIds and relationshipDensity for filters/explanations", () => {
    const wire = toSearchIndexWireDocument(
      doc({
        id: "thinker-john-dewey",
        entityType: "thinker",
        title: "John Dewey",
        bookIds: ["book-a"],
        relationshipDensity: 4,
      }),
    );
    expect(wire.bookIds).toEqual(["book-a"]);
    expect(wire.relationshipDensity).toBe(4);
  });
});

describe("buildSearchIndexPayload", () => {
  it("maps every document through the wire leaner", () => {
    const payload = buildSearchIndexPayload(
      [
        doc({
          id: "concept-certainty",
          title: "Certainty",
          searchText: "Certainty\nExtra enrichment line for matching.",
          conceptIds: ["concept-trust"],
        }),
      ],
      { version: 1, entries: [] },
      "2026-07-19T00:00:00.000Z",
    );

    expect(payload.documentCount).toBe(1);
    expect(payload.documents[0]?.conceptIds).toBeUndefined();
    expect(payload.documents[0]?.searchText).toBe("Extra enrichment line for matching.");
  });
});

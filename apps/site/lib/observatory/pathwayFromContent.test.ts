import { describe, expect, it } from "vitest";

import {
  pathwayFromEnrichedStops,
  pathwayGraphNodeIds,
  pathwayGraphPairKeys,
  resolvePathwayStepIndex,
} from "@/lib/observatory/pathwayFromContent";
import type { EnrichedPathStop } from "@/types/paths";

const stops: EnrichedPathStop[] = [
  {
    position: 1,
    entityType: "concept",
    entityId: "concept-judgment",
    description: "Judgment as practice.",
    resolvedEntityId: "concept-judgment",
    title: "Judgment",
    href: "/explore/concepts/judgment",
    external: false,
    entityTypeLabel: "Concept",
    estimatedMinutes: 5,
  },
  {
    position: 2,
    entityType: "external",
    entityId: "external",
    externalUrl: "https://example.com",
    description: "External reading.",
    resolvedEntityId: "external",
    title: "External resource",
    href: "https://example.com",
    external: true,
    entityTypeLabel: "External",
    estimatedMinutes: 10,
  },
  {
    position: 3,
    entityType: "book",
    entityId: "book-coupling",
    description: "Coupling book.",
    resolvedEntityId: "book-coupling",
    title: "Coupling",
    href: "/explore/books/coupling",
    external: false,
    entityTypeLabel: "Book",
    estimatedMinutes: 25,
  },
];

describe("pathwayFromEnrichedStops", () => {
  it("maps enriched stops to graph-aware pathway steps", () => {
    const pathway = pathwayFromEnrichedStops({
      id: "judgment-before-certainty",
      slug: "judgment-before-certainty",
      title: "Judgment Before Certainty",
      description: "Summary",
      sourceType: "trail",
      sourceHref: "/trails/judgment-before-certainty",
      stops,
    });

    expect(pathway.steps).toHaveLength(3);
    expect(pathway.steps[1]?.canonicalId).toBeNull();
    expect(pathwayGraphNodeIds(pathway)).toEqual(["concept-judgment", "book-coupling"]);
    expect([...pathwayGraphPairKeys(pathwayGraphNodeIds(pathway))]).toEqual([
      "book-coupling|concept-judgment",
    ]);
  });

  it("resolves step index from position param", () => {
    const pathway = pathwayFromEnrichedStops({
      id: "test",
      slug: "test",
      title: "Test",
      description: "Summary",
      sourceType: "question",
      sourceHref: "/questions/test",
      stops,
    });

    expect(resolvePathwayStepIndex(pathway, "3")).toBe(2);
    expect(resolvePathwayStepIndex(pathway, null)).toBe(0);
  });
});

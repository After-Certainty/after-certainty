import { describe, expect, it } from "vitest";

import {
  resolveSelectedConceptsWithRoles,
  resolveSelectedPatternsWithRoles,
} from "@/lib/books/selected-entity-roles";
import type { GlossaryConcept, Pattern } from "@/types/semanticGraph";

const conceptsById = new Map<string, GlossaryConcept>([
  [
    "concept-agency",
    {
      id: "concept-agency",
      slug: "agency",
      title: "Agency",
      shortDefinition: "Capacity to act.",
    },
  ],
  [
    "concept-trust",
    {
      id: "concept-trust",
      slug: "trust",
      title: "Trust",
      shortDefinition: "Reliance under uncertainty.",
    },
  ],
]);

const patternsById = new Map<string, Pattern>([
  [
    "pattern-a",
    {
      id: "pattern-a",
      slug: "a",
      title: "Pattern A",
      summary: "Global summary A.",
    },
  ],
]);

describe("selected entity roles", () => {
  it("prefers work-specific concept roles and preserves curated order", () => {
    const resolved = resolveSelectedConceptsWithRoles({
      selectedConceptIds: ["concept-trust", "concept-agency"],
      roles: [{ conceptId: "concept-agency", roleInWork: "Agency role in this book." }],
      conceptsById,
    });
    expect(resolved.map((r) => r.concept.id)).toEqual(["concept-trust", "concept-agency"]);
    expect(resolved[0]?.roleInWork).toBeUndefined();
    expect(resolved[1]?.roleInWork).toBe("Agency role in this book.");
  });

  it("prefers work-specific pattern roles", () => {
    const resolved = resolveSelectedPatternsWithRoles({
      selectedPatternIds: ["pattern-a"],
      roles: [{ patternId: "pattern-a", roleInWork: "Dramatizes the failure mode." }],
      patternsById,
    });
    expect(resolved[0]?.roleInWork).toBe("Dramatizes the failure mode.");
  });

  it("skips invalid role targets silently", () => {
    const resolved = resolveSelectedConceptsWithRoles({
      selectedConceptIds: ["concept-missing", "concept-agency"],
      roles: [{ conceptId: "concept-missing", roleInWork: "Should not appear." }],
      conceptsById,
    });
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.concept.id).toBe("concept-agency");
  });
});

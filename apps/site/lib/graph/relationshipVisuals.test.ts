import { describe, expect, it } from "vitest";

import {
  formatRelationshipLabelForDisplay,
  normalizePredicateKey,
  styleForRelationshipPredicate,
} from "@/lib/graph/relationshipVisuals";

describe("relationshipVisuals", () => {
  it("normalizes predicate keys", () => {
    expect(normalizePredicateKey("  Preserves ")).toBe("preserves");
  });

  it("formats display labels without mangling matching keys", () => {
    expect(formatRelationshipLabelForDisplay("structural_tension")).toBe("structural tension");
    expect(normalizePredicateKey("structural_tension")).toBe("structural_tension");
    expect(formatRelationshipLabelForDisplay("  a__b  c ")).toBe("a b c");
  });

  it("styles known predicates", () => {
    expect(styleForRelationshipPredicate("Preserves").stroke).toBe("var(--accent)");
    expect(styleForRelationshipPredicate("structural_tension").strokeDasharray).toBe("6 4");
    expect(styleForRelationshipPredicate("thins").stroke).toMatch(/^#/);
    expect(styleForRelationshipPredicate("renews").stroke).toMatch(/^#/);
    expect(styleForRelationshipPredicate("threatens").stroke).toMatch(/^#/);
    expect(styleForRelationshipPredicate("Decouples").strokeDasharray).toBeDefined();
  });

  it("styles new relationship types", () => {
    expect(styleForRelationshipPredicate("weakens").stroke).toMatch(/^#/);
    expect(styleForRelationshipPredicate("weakens").strokeWidth).toBe(1.5);

    expect(styleForRelationshipPredicate("hardens").stroke).toMatch(/^#/);
    expect(styleForRelationshipPredicate("hardens").strokeWidth).toBe(1.5);

    expect(styleForRelationshipPredicate("constrains").stroke).toMatch(/^#/);
    expect(styleForRelationshipPredicate("constrains").strokeDasharray).toBe("5 3");

    expect(styleForRelationshipPredicate("contrasts").stroke).toContain("var(--muted)");
    expect(styleForRelationshipPredicate("contrasts").strokeWidth).toBe(1.2);

    expect(styleForRelationshipPredicate("requires").stroke).toMatch(/^#/);
    expect(styleForRelationshipPredicate("requires").strokeWidth).toBe(1.3);

    expect(styleForRelationshipPredicate("precedes").stroke).toMatch(/^#/);
    expect(styleForRelationshipPredicate("precedes").strokeDasharray).toBe("8 4");

    expect(styleForRelationshipPredicate("intensifies").stroke).toMatch(/^#/);
    expect(styleForRelationshipPredicate("intensifies").strokeWidth).toBe(1.5);

    expect(styleForRelationshipPredicate("complements").stroke).toMatch(/^#/);
    expect(styleForRelationshipPredicate("complements").strokeWidth).toBe(1.4);
  });

  it("falls back for unknown predicates", () => {
    const s = styleForRelationshipPredicate("custom-link");
    expect(s.strokeWidth).toBe(1.05);
    expect(s.stroke).toContain("var(--muted)");
  });
});

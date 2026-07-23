import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuestionPath } from "@/components/questions/question-path";
import type { EnrichedPathStop } from "@/types/questions";

const fixtureStops: EnrichedPathStop[] = [
  {
    position: 1,
    entityType: "concept",
    entityId: "concept-bias",
    description: "Partial sight before malice.",
    whyThisFollows: "Missing often begins with what a vantage point cannot see.",
    resolvedEntityId: "concept-bias",
    title: "Bias",
    href: "/explore/concepts/bias",
    external: false,
    entityTypeLabel: "Concept",
    estimatedMinutes: 5,
  },
  {
    position: 2,
    entityType: "book",
    entityId: "book-why-diversity-matters",
    description: "Primary depth on what gets noticed and ignored.",
    resolvedEntityId: "book-why-diversity-matters",
    title: "Why Diversity Matters",
    href: "/explore/books/why-diversity-matters",
    external: false,
    entityTypeLabel: "Book",
    estimatedMinutes: 25,
  },
];

describe("QuestionPath", () => {
  it("renders an ordered list with accessible stop labels", () => {
    render(<QuestionPath stops={fixtureStops} questionId="good-intentions-still-miss" />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("Stop 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Stop 2 of 2")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open Why Diversity Matters \(Book\)/i }),
    ).toHaveAttribute("href", "/explore/books/why-diversity-matters");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/questions/question-section-analytics", () => ({
  QuestionSectionAnalytics: () => null,
}));

vi.mock("@/lib/questions/getEnrichedQuestions", () => ({
  getEnrichedPublishedQuestions: vi.fn().mockResolvedValue([
    {
      id: "trust-survives-disagreement",
      slug: "trust-survives-disagreement",
      question: "How can trust survive disagreement?",
      shortLabel: "Trust under disagreement",
      summary: "Summary one.",
      featured: true,
      families: ["Trust and disagreement"],
      pathStops: [],
      pathStopsEnriched: [{ position: 1 }],
      totalEstimatedMinutes: 25,
    },
    {
      id: "act-before-certainty",
      slug: "act-before-certainty-arrives",
      question: "How do we act before certainty arrives?",
      summary: "Summary two.",
      featured: false,
      families: ["Judgment under uncertainty"],
      pathStops: [],
      pathStopsEnriched: [{ position: 1 }],
      totalEstimatedMinutes: 30,
    },
  ]),
}));

import { QuestionsIndexContent } from "@/components/questions/questions-index-content";

describe("QuestionsIndexContent", () => {
  it("renders dense hero, featured, and family anchors", async () => {
    const ui = await QuestionsIndexContent();
    const { container } = render(ui);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Begin with a tension you recognize",
      }),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-path-index-density="editorial"]')).toBeTruthy();
    expect(container.querySelector("[data-path-index-featured]")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Featured questions" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Question families" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Trust and disagreement" }),
    ).toHaveAttribute("href", "#family-trust-and-disagreement");
    expect(screen.getByRole("heading", { name: "Trust and disagreement" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Search the commons/i })).toHaveAttribute(
      "href",
      "/search",
    );
  });
});

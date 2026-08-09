import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuestionRelatedTrailsSection } from "@/components/trails/question-related-trails-section";
import type { QuestionDefinition } from "@/types/questions";
import type { EnrichedTrail } from "@/types/trails";

vi.mock("@/lib/trails/getEnrichedTrailsForQuestion", () => ({
  getEnrichedTrailsForQuestion: vi.fn(),
}));

import { getEnrichedTrailsForQuestion } from "@/lib/trails/getEnrichedTrailsForQuestion";

const mockQuestion = {
  id: "act-before-certainty-arrives",
  slug: "act-before-certainty-arrives",
} as QuestionDefinition;

const mockTrail: EnrichedTrail = {
  id: "judgment-before-certainty",
  slug: "judgment-before-certainty",
  title: "Judgment Before Certainty",
  summary: "How to keep thinking when the full picture has not arrived.",
  orientation: "Orientation text.",
  status: "published",
  themes: ["Judgment"],
  primaryBookId: "book-before-certainty-arrives",
  pathStops: [],
  pathStopsEnriched: [],
  totalEstimatedMinutes: 45,
  closingReflection: "Reflection.",
};

describe("QuestionRelatedTrailsSection", () => {
  it("renders related trails collapsed with a count on mobile", async () => {
    vi.mocked(getEnrichedTrailsForQuestion).mockResolvedValue([mockTrail]);

    render(await QuestionRelatedTrailsSection({ question: mockQuestion }));

    expect(screen.getAllByText("1 trail").length).toBeGreaterThan(0);
    const toggle = screen.getByRole("button", { name: /related reading trail/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: /Judgment Before Certainty/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse all reading trails/i })).toHaveAttribute(
      "href",
      "/trails",
    );
  });

  it("renders nothing when no trails match", async () => {
    vi.mocked(getEnrichedTrailsForQuestion).mockResolvedValue([]);

    const { container } = render(await QuestionRelatedTrailsSection({ question: mockQuestion }));

    expect(container).toBeEmptyDOMElement();
  });
});

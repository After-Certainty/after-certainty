import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuestionCard } from "@/components/questions/question-card";
import type { EnrichedQuestion } from "@/types/questions";

const question = {
  id: "trust-survives-disagreement",
  slug: "trust-survives-disagreement",
  question: "How can trust survive disagreement?",
  shortLabel: "How can trust survive disagreement?",
  summary: "A longer summary that should not appear in compact density.",
  families: ["Trust & disagreement"],
  pathStopsEnriched: [{}, {}, {}, {}],
  totalEstimatedMinutes: 43,
} as unknown as EnrichedQuestion;

describe("QuestionCard", () => {
  it("omits summary and follow CTA in compact density", () => {
    render(<QuestionCard question={question} location="home" density="compact" />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/questions/trust-survives-disagreement",
    );
    expect(screen.getByText(/Trust & disagreement/i)).toBeInTheDocument();
    expect(screen.getByText(/4 stops · ~43 min/i)).toBeInTheDocument();
    expect(screen.queryByText(/longer summary/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Follow this question/i)).not.toBeInTheDocument();
  });

  it("keeps summary for default density", () => {
    render(<QuestionCard question={question} location="index" />);
    expect(screen.getByText(/longer summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Follow this question/i)).toBeInTheDocument();
  });
});

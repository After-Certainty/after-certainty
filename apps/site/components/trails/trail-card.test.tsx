import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrailCard } from "@/components/trails/trail-card";
import type { EnrichedTrail } from "@/types/trails";

const fixtureTrail: EnrichedTrail = {
  id: "judgment-before-certainty",
  slug: "judgment-before-certainty",
  title: "Judgment Before Certainty",
  summary: "How to keep thinking when the full picture has not arrived.",
  orientation: "Orientation text.",
  status: "published",
  featured: true,
  themes: ["Judgment"],
  pathStops: [],
  closingReflection: "Closing.",
  pathStopsEnriched: [
    {
      position: 1,
      entityType: "concept",
      entityId: "concept-judgment",
      description: "Start with judgment.",
      resolvedEntityId: "concept-judgment",
      title: "Judgment",
      href: "/explore/concepts/judgment",
      external: false,
      entityTypeLabel: "Concept",
      estimatedMinutes: 5,
    },
  ],
  totalEstimatedMinutes: 5,
};

describe("TrailCard", () => {
  it("renders trail title, summary, and follow CTA", () => {
    render(<TrailCard trail={fixtureTrail} />);

    expect(screen.getByRole("link", { name: /Judgment Before Certainty/i })).toHaveAttribute(
      "href",
      "/trails/judgment-before-certainty",
    );
    expect(screen.getByText(/Follow this trail/i)).toBeInTheDocument();
    expect(screen.getByText(/1 stops · ~5 min/i)).toBeInTheDocument();
  });
});

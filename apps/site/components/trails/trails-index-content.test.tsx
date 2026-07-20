import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/trails/trail-section-analytics", () => ({
  TrailSectionAnalytics: () => null,
}));

vi.mock("@/lib/trails/getEnrichedTrails", () => ({
  getEnrichedPublishedTrails: vi.fn().mockResolvedValue([
    {
      id: "judgment-before-certainty",
      slug: "judgment-before-certainty",
      title: "Judgment Before Certainty",
      summary: "Summary one.",
      orientation: "Orientation.",
      status: "published",
      featured: true,
      themes: ["Judgment"],
      pathStops: [],
      closingReflection: "Close.",
      pathStopsEnriched: [{ position: 1 }],
      totalEstimatedMinutes: 30,
    },
    {
      id: "systems-without-correction",
      slug: "systems-without-correction",
      title: "Systems That Cannot Correct Themselves",
      summary: "Summary two.",
      orientation: "Orientation.",
      status: "published",
      featured: false,
      themes: ["Systems"],
      pathStops: [],
      closingReflection: "Close.",
      pathStopsEnriched: [{ position: 1 }],
      totalEstimatedMinutes: 40,
    },
  ]),
}));

import { TrailsIndexContent } from "@/components/trails/trails-index-content";

describe("TrailsIndexContent", () => {
  it("renders hero and trail sections", async () => {
    const ui = await TrailsIndexContent({});
    render(ui);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Follow a deliberate path through the commons",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Featured trails" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Judgment" })).toBeInTheDocument();
  });

  it("shows empty state when theme filter matches nothing", async () => {
    const ui = await TrailsIndexContent({ themeFilter: "nonexistent-theme" });
    render(ui);

    expect(screen.getByText(/No published trails match that theme/i)).toBeInTheDocument();
  });
});

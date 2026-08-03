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
  getEnrichedUpcomingTrails: vi.fn().mockResolvedValue([
    {
      id: "where-institutions-look",
      slug: "where-institutions-look",
      title: "Where Institutions Look",
      summary: "Upcoming summary.",
      orientation: "Orientation.",
      status: "upcoming",
      featured: false,
      themes: ["Attention"],
      pathStops: [],
      closingReflection: "Close.",
      pathStopsEnriched: [{ position: 1 }],
      totalEstimatedMinutes: 50,
    },
  ]),
}));

import { TrailsIndexContent } from "@/components/trails/trails-index-content";

describe("TrailsIndexContent", () => {
  it("renders dense hero, featured, themes, and upcoming", async () => {
    const ui = await TrailsIndexContent({});
    const { container } = render(ui);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Follow a deliberate path through the commons",
      }),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-path-index-density="editorial"]')).toBeTruthy();
    expect(container.querySelector("[data-path-index-featured]")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Featured trails" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Judgment" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Coming soon" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Where Institutions Look/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Judgment" })).toHaveAttribute(
      "href",
      "/trails?theme=judgment",
    );
    expect(screen.getAllByRole("link", { name: /Start with a Question/i })[0]).toHaveAttribute(
      "href",
      "/questions",
    );
  });

  it("shows empty state when theme filter matches nothing", async () => {
    const ui = await TrailsIndexContent({ themeFilter: "nonexistent-theme" });
    render(ui);

    expect(screen.getByText(/No trails match that theme/i)).toBeInTheDocument();
  });

  it("hides featured when a theme filter is active", async () => {
    const ui = await TrailsIndexContent({ themeFilter: "judgment" });
    const { container } = render(ui);

    expect(container.querySelector("[data-path-index-featured]")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Featured trails" })).not.toBeInTheDocument();
  });
});

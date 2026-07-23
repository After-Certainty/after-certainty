import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/trails/trail-section-analytics", () => ({
  TrailSectionAnalytics: () => null,
}));

vi.mock("@/lib/trails/getEnrichedTrails", () => ({
  getEnrichedFeaturedTrails: vi.fn().mockResolvedValue([
    {
      id: "judgment-before-certainty",
      slug: "judgment-before-certainty",
      title: "Judgment Before Certainty",
      summary: "Summary.",
      orientation: "Orientation.",
      status: "published",
      featured: true,
      themes: ["Judgment"],
      pathStops: [],
      closingReflection: "Close.",
      pathStopsEnriched: [{ position: 1 }],
      totalEstimatedMinutes: 30,
    },
  ]),
}));

import { FeaturedTrailsSection } from "@/components/trails/featured-trails-section";

describe("FeaturedTrailsSection", () => {
  it("renders homepage featured trails", async () => {
    const ui = await FeaturedTrailsSection();
    render(ui);

    expect(screen.getByRole("heading", { name: "Follow a reading trail" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Judgment Before Certainty/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse all reading trails/i })).toHaveAttribute(
      "href",
      "/trails",
    );
  });
});

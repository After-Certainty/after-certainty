import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: function MockImage({ alt, src }: { alt?: string; src?: string }) {
    // eslint-disable-next-line @next/next/no-img-element -- test double
    return <img alt={alt ?? ""} src={typeof src === "string" ? src : undefined} />;
  },
}));

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
    {
      id: "leadership-after-the-person",
      slug: "leadership-after-the-person",
      title: "Leadership After the Person",
      summary: "Summary.",
      orientation: "Orientation.",
      status: "published",
      featured: true,
      themes: ["Leadership"],
      pathStops: [],
      closingReflection: "Close.",
      pathStopsEnriched: [{ position: 1 }],
      totalEstimatedMinutes: 40,
    },
  ]),
}));

import { FeaturedTrailsSection } from "@/components/trails/featured-trails-section";

describe("FeaturedTrailsSection", () => {
  it("renders homepage featured trails with dedicated card imagery", async () => {
    const ui = await FeaturedTrailsSection();
    render(ui);

    expect(screen.getByRole("heading", { name: "Follow a reading trail" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Judgment Before Certainty/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse all reading trails/i })).toHaveAttribute(
      "href",
      "/trails",
    );
    expect(document.querySelector("[data-home-trails-scroller]")).toBeTruthy();
    expect(document.querySelector("[data-home-trail-card]")).toBeTruthy();
    expect(
      document.querySelector(
        'img[src="/images/home/trails/judgment-before-certainty.webp"]',
      ),
    ).toBeTruthy();
    expect(
      document.querySelector(
        'img[src="/images/home/trails/leadership-after-the-person.webp"]',
      ),
    ).toBeTruthy();
  });
});

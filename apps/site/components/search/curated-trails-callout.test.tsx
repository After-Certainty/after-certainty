import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CuratedTrailsCallout } from "@/components/search/curated-trails-callout";
import type { EnrichedTrail } from "@/types/trails";

const fixtureTrail: EnrichedTrail = {
  id: "judgment-before-certainty",
  slug: "judgment-before-certainty",
  title: "Judgment Before Certainty",
  summary: "Summary.",
  orientation: "Orientation.",
  status: "published",
  themes: ["Judgment"],
  pathStops: [],
  closingReflection: "Close.",
  pathStopsEnriched: [{ position: 1 }],
  totalEstimatedMinutes: 30,
};

describe("CuratedTrailsCallout", () => {
  it("renders matched trails with section label", () => {
    render(<CuratedTrailsCallout trails={[fixtureTrail]} />);

    expect(screen.getByRole("region", { name: "Curated reading trails" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Curated reading trails" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Judgment Before Certainty/i })).toBeInTheDocument();
  });

  it("returns null when no trails match", () => {
    const { container } = render(<CuratedTrailsCallout trails={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

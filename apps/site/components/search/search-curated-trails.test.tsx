import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchCuratedTrails } from "@/components/search/search-curated-trails";
import type { EnrichedTrail, TrailSearchBridge } from "@/types/trails";

const enrichedTrails: EnrichedTrail[] = [
  {
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
  },
  {
    id: "software-judgment-trail",
    slug: "software-judgment-trail",
    title: "After Certainty for Software Engineers",
    summary: "Summary.",
    orientation: "Orientation.",
    status: "published",
    themes: ["Practice"],
    pathStops: [],
    closingReflection: "Close.",
    pathStopsEnriched: [{ position: 1 }],
    totalEstimatedMinutes: 40,
  },
];

const searchBridges: TrailSearchBridge[] = [
  {
    terms: ["reading trail judgment"],
    trailIds: ["judgment-before-certainty"],
  },
  {
    terms: ["software engineers"],
    trailIds: ["software-judgment-trail"],
  },
];

describe("SearchCuratedTrails", () => {
  it("shows bridged trail for matching query", () => {
    render(
      <SearchCuratedTrails
        query="reading trail judgment"
        enrichedTrails={enrichedTrails}
        searchBridges={searchBridges}
      />,
    );

    expect(screen.getByRole("link", { name: /Judgment Before Certainty/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /After Certainty for Software Engineers/i }),
    ).not.toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PathStopCard } from "@/components/paths/path-stop-card";
import type { EnrichedPathStop } from "@/types/paths";

const stop: EnrichedPathStop = {
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
};

describe("PathStopCard", () => {
  it("renders shared stop card content and analytics link", () => {
    render(
      <PathStopCard
        stop={stop}
        stopIndex={1}
        totalStops={3}
        visited
        current
        analytics={{ event: "trail_stop_open", params: { trail_id: "test", stop_position: 1 } }}
      />,
    );

    expect(screen.getByText("Visited")).toBeInTheDocument();
    expect(screen.getByText("Continue here")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Judgment \(Concept\)/i })).toHaveAttribute(
      "href",
      "/explore/concepts/judgment",
    );
  });
});

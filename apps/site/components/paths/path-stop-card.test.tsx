import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PathStopCard } from "@/components/paths/path-stop-card";
import type { EnrichedPathStop } from "@/types/paths";

const stop: EnrichedPathStop = {
  position: 1,
  entityType: "concept",
  entityId: "concept-judgment",
  description: "Start with judgment.",
  whyThisFollows: "Trust starts before the harder cases arrive.",
  resolvedEntityId: "concept-judgment",
  title: "Judgment",
  href: "/explore/concepts/judgment",
  external: false,
  entityTypeLabel: "Concept",
  estimatedMinutes: 5,
};

describe("PathStopCard", () => {
  it("renders shared stop card content and analytics link", () => {
    const { container } = render(
      <PathStopCard
        stop={stop}
        stopIndex={1}
        totalStops={3}
        visited
        current
        analytics={{ event: "trail_stop_open", params: { trail_id: "test", stop_position: 1 } }}
      />,
    );

    expect(container.querySelector('[data-path-stop-density="compact"]')).toBeTruthy();
    expect(screen.getByText("Visited")).toBeInTheDocument();
    expect(screen.getByText("Continue here")).toBeInTheDocument();
    expect(screen.getByText(/Stop 1 of 3/)).toBeInTheDocument();
    expect(screen.getByText("Concept")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Judgment \(Concept\)/i })).toHaveAttribute(
      "href",
      "/explore/concepts/judgment",
    );
  });

  it("discloses why-this-follows on mobile toggle", async () => {
    const user = userEvent.setup();
    render(
      <PathStopCard
        stop={stop}
        stopIndex={1}
        totalStops={3}
        analytics={{ event: "question_stop_open", params: { question_id: "q", stop_position: 1 } }}
      />,
    );

    const toggle = screen.getByRole("button", { name: /Why this follows/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Trust starts before the harder cases arrive.")).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});

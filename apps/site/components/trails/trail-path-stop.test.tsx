import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrailPathStop } from "@/components/trails/trail-path-stop";
import type { EnrichedPathStop } from "@/types/paths";

const requiredStop: EnrichedPathStop = {
  position: 1,
  entityType: "concept",
  entityId: "concept-judgment",
  description: "Start with judgment as ongoing work.",
  resolvedEntityId: "concept-judgment",
  title: "Judgment",
  href: "/explore/concepts/judgment",
  external: false,
  entityTypeLabel: "Concept",
  estimatedMinutes: 5,
};

const optionalStop: EnrichedPathStop = {
  position: 2,
  entityType: "book",
  entityId: "book-the-relay",
  description: "A fiction doorway.",
  whyThisFollows: "Story holds tension argument cannot.",
  optional: true,
  fictionDoorway: true,
  resolvedEntityId: "book-the-relay",
  title: "The Relay",
  href: "/explore/books/the-relay",
  external: false,
  entityTypeLabel: "Book",
  estimatedMinutes: 45,
  bookStatus: "published",
};

describe("TrailPathStop", () => {
  it("renders stop sequence and accessible link", () => {
    render(<TrailPathStop stop={requiredStop} trailId="test-trail" stopIndex={1} totalStops={2} />);

    expect(screen.getByText("Stop 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Judgment" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Judgment \(Concept\)/i })).toHaveAttribute(
      "href",
      "/explore/concepts/judgment",
    );
  });

  it("shows optional badge and fiction disclaimer", () => {
    render(<TrailPathStop stop={optionalStop} trailId="test-trail" stopIndex={2} totalStops={2} />);

    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getByText("A fiction doorway — story, not proof")).toBeInTheDocument();
    expect(screen.getByText(/Why this follows:/i)).toBeInTheDocument();
  });

  it("shows upcoming status for non-published books", () => {
    render(
      <TrailPathStop
        stop={{ ...optionalStop, bookStatus: "forthcoming" }}
        trailId="test-trail"
        stopIndex={2}
        totalStops={2}
      />,
    );

    expect(screen.getByText("Upcoming")).toBeInTheDocument();
  });
});

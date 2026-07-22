import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WhatsNewFilters } from "@/components/whats-new/whats-new-filters";
import { WhatsNewEventCard } from "@/components/whats-new/whats-new-event-card";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

const sample: WhatsNewEvent = {
  id: "event-sample",
  type: "book_published",
  title: "Sample Book published",
  summary: "Why a visitor should care about this update.",
  date: "2026-06-01",
  entityType: "book",
  entityId: "book-sample",
  href: "/explore/books/sample",
  visibility: "public",
  source: "authored",
  published: true,
};

describe("WhatsNewFilters", () => {
  it("marks the active filter and offers reset when filtered", () => {
    render(<WhatsNewFilters active="books" />);
    expect(screen.getByRole("link", { name: "Books" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Reset filters" })).toHaveAttribute(
      "href",
      "/whats-new",
    );
  });
});

describe("WhatsNewEventCard", () => {
  it("links title and CTA to the event href", () => {
    render(<WhatsNewEventCard event={sample} location="index" />);
    expect(screen.getByRole("heading", { name: sample.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: sample.title })).toHaveAttribute(
      "href",
      "/explore/books/sample",
    );
    expect(screen.getByText(/New book/i)).toBeInTheDocument();
    expect(screen.getByText(sample.summary)).toBeInTheDocument();
  });
});

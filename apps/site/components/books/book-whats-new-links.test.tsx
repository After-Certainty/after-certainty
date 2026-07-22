import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BookWhatsNewLinks } from "@/components/books/book-whats-new-links";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

const event: WhatsNewEvent = {
  id: "event-book-sample-published",
  type: "book_published",
  title: "Sample is published",
  summary: "A new volume.",
  date: "2026-03-01",
  entityType: "book",
  entityId: "book-sample",
  href: "/explore/books/sample",
  visibility: "public",
  source: "authored",
  published: true,
};

describe("BookWhatsNewLinks", () => {
  it("lists related events and a full feed link", () => {
    render(<BookWhatsNewLinks bookId="book-sample" events={[event]} />);
    expect(screen.getByRole("link", { name: "Sample is published" })).toHaveAttribute(
      "href",
      "/explore/books/sample",
    );
    expect(screen.getByRole("link", { name: "Browse all updates" })).toHaveAttribute(
      "href",
      "/whats-new",
    );
  });

  it("falls back to the full feed when there are no events", () => {
    render(<BookWhatsNewLinks bookId="book-sample" events={[]} />);
    expect(
      screen.getByRole("link", { name: /See what’s new across the project/i }),
    ).toHaveAttribute("href", "/whats-new");
  });
});

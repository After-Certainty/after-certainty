import { describe, expect, it } from "vitest";

import { findWhatsNewEventsForBook } from "@/lib/whats-new/findEventsForBook";
import { buildPublicWhatsNewEvents } from "@/lib/whats-new/publicEvents";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

describe("findWhatsNewEventsForBook", () => {
  it("returns published events for a seeded book", () => {
    const events = findWhatsNewEventsForBook("book-after-certainty");
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.entityId === "book-after-certainty")).toBe(true);
    expect(events[0]?.href).toContain("/explore/books/after-certainty");
  });

  it("includes events that list the book as relatedEditionId", () => {
    const fixture: WhatsNewEvent[] = [
      {
        id: "event-book-companion-published",
        type: "book_published",
        title: "Companion published",
        summary: "A companion volume.",
        date: "2026-06-01",
        entityType: "book",
        entityId: "book-when-others-look-to-you-v2",
        relatedEditionId: "book-when-others-look-to-you-v1",
        href: "/explore/books/when-others-look-to-you-v2",
        visibility: "public",
        source: "authored",
        published: true,
      },
    ];
    const forPrimary = findWhatsNewEventsForBook("book-when-others-look-to-you-v1", {
      events: fixture,
    });
    expect(forPrimary).toHaveLength(1);
    expect(forPrimary[0]?.entityId).toBe("book-when-others-look-to-you-v2");
  });

  it("respects limit against the public feed", () => {
    const all = buildPublicWhatsNewEvents().filter(
      (e) => e.entityType === "book" && e.entityId === "book-after-certainty",
    );
    const limited = findWhatsNewEventsForBook("book-after-certainty", { limit: 1 });
    expect(limited).toHaveLength(Math.min(1, all.length));
  });
});

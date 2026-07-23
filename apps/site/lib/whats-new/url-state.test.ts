import { describe, expect, it } from "vitest";

import {
  filterWhatsNewEvents,
  parseWhatsNewFilter,
  whatsNewHref,
  whatsNewQueryString,
} from "@/lib/whats-new/url-state";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

const sampleEvents: WhatsNewEvent[] = [
  {
    id: "event-a",
    type: "book_published",
    title: "A",
    summary: "A",
    date: "2026-06-01",
    entityType: "book",
    entityId: "book-a",
    href: "/explore/books/a",
    visibility: "public",
    source: "authored",
    published: true,
  },
  {
    id: "event-b",
    type: "podcast_episode",
    title: "B",
    summary: "B",
    date: "2026-05-01",
    entityType: "podcast",
    entityId: "ep-b",
    href: "/podcast",
    visibility: "public",
    source: "authored",
    published: true,
  },
  {
    id: "event-c",
    type: "book_revised",
    title: "C",
    summary: "C",
    date: "2026-04-01",
    entityType: "book",
    entityId: "book-c",
    href: "/explore/books/c",
    visibility: "public",
    source: "authored",
    published: true,
  },
];

describe("whats-new url state", () => {
  it("parses known filters and defaults to all", () => {
    expect(parseWhatsNewFilter("books")).toBe("books");
    expect(parseWhatsNewFilter("revisions")).toBe("revisions");
    expect(parseWhatsNewFilter(["podcast"])).toBe("podcast");
    expect(parseWhatsNewFilter("nope")).toBe("all");
    expect(parseWhatsNewFilter(undefined)).toBe("all");
  });

  it("builds filter hrefs without indexing combinations", () => {
    expect(whatsNewQueryString("all")).toBe("");
    expect(whatsNewHref("all")).toBe("/whats-new");
    expect(whatsNewHref("site")).toBe("/whats-new?type=site");
  });

  it("filters events by bucket", () => {
    expect(filterWhatsNewEvents(sampleEvents, "books").map((e) => e.id)).toEqual(["event-a"]);
    expect(filterWhatsNewEvents(sampleEvents, "podcast").map((e) => e.id)).toEqual(["event-b"]);
    expect(filterWhatsNewEvents(sampleEvents, "revisions").map((e) => e.id)).toEqual(["event-c"]);
    expect(filterWhatsNewEvents(sampleEvents, "all")).toHaveLength(3);
  });
});

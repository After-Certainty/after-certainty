import { describe, expect, it } from "vitest";

import siteWhatsNew from "@/data/site-whats-new.json";
import { parseWhatsNewManifest, whatsNewFilterBucket } from "@/lib/whats-new/schema";

describe("whats-new schema", () => {
  it("parses the site-owned What’s New seed", () => {
    const parsed = parseWhatsNewManifest(siteWhatsNew);
    expect(parsed.manifestVersion).toBe(1);
    expect(parsed.launchFrom).toBe("2026-01-01");
    expect(parsed.events.length).toBeGreaterThanOrEqual(3);
    expect(parsed.events.every((e) => e.source === "authored")).toBe(true);
    expect(parsed.events.every((e) => e.type !== "book_published")).toBe(true);
  });

  it("rejects generated book_revised candidates", () => {
    expect(() =>
      parseWhatsNewManifest({
        manifestVersion: 1,
        events: [
          {
            id: "event-bad-revision",
            type: "book_revised",
            title: "Revised",
            summary: "Changed a lot",
            date: "2026-07-01",
            entityType: "book",
            entityId: "book-after-certainty",
            href: "/explore/books/after-certainty",
            visibility: "public",
            source: "generated_candidate",
            published: true,
          },
        ],
      }),
    ).toThrow();
  });

  it("maps types to filter buckets", () => {
    expect(whatsNewFilterBucket("book_published")).toBe("books");
    expect(whatsNewFilterBucket("book_announced")).toBe("books");
    expect(whatsNewFilterBucket("book_revised")).toBe("revisions");
    expect(whatsNewFilterBucket("podcast_episode")).toBe("podcast");
    expect(whatsNewFilterBucket("site_feature")).toBe("site");
  });
});

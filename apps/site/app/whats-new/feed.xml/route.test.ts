import { describe, expect, it } from "vitest";

import { GET } from "@/app/whats-new/feed.xml/route";

describe("whats-new RSS feed", () => {
  it("returns rss xml with channel and seeded items", async () => {
    process.env.SEMANTIC_MANIFEST_OFFLINE = "1";
    const res = await GET();
    expect(res.headers.get("Content-Type")).toContain("application/rss+xml");
    const body = await res.text();
    expect(body).toContain("<rss");
    expect(body).toContain("What’s New");
    expect(body).toContain("event-book-after-certainty-published");
    expect(body).toContain("/explore/books/after-certainty");
  });
});

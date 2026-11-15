import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trackChapterOpen, trackNextChapter } from "@/lib/analytics/track-reader";

const track = vi.fn();
vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => track(...args),
}));

describe("track-reader", () => {
  beforeEach(() => {
    track.mockClear();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_PROPERTY_LIMIT;
  });

  it("emits Vercel chapter_open and chapter_advance", () => {
    trackChapterOpen({ book_id: "book-1", chapter_id: "ch-1", edition_id: "edition-1" });
    trackNextChapter({ book_id: "book-1", from_chapter_id: "ch-1", to_chapter_id: "ch-2" });
    expect(track).toHaveBeenCalledWith("chapter_open", { book_id: "book-1", chapter_id: "ch-1" });
    expect(track).toHaveBeenCalledWith("chapter_advance", {
      from_chapter_id: "ch-1",
      to_chapter_id: "ch-2",
    });
  });
});

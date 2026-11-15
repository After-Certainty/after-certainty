import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trackReaderEvent } from "@/lib/analytics/reader";

const track = vi.fn();
vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => track(...args),
}));

describe("trackReaderEvent (Vercel-only)", () => {
  const env = process.env;

  beforeEach(() => {
    track.mockClear();
  });

  afterEach(() => {
    process.env = env;
  });

  it("sends chapter_open to Vercel", () => {
    trackReaderEvent({
      name: "chapter_open",
      properties: { book_id: "book-1", chapter_id: "ch-1", edition_id: "ed-1" },
    });
    expect(track).toHaveBeenCalledWith("chapter_open", { book_id: "book-1", chapter_id: "ch-1" });
  });

  it("sends chapter_advance with destination chapter ids", () => {
    trackReaderEvent({
      name: "chapter_advance",
      properties: {
        book_id: "book-1",
        from_chapter_id: "ch-1",
        to_chapter_id: "ch-2",
      },
    });
    expect(track).toHaveBeenCalledWith("chapter_advance", {
      from_chapter_id: "ch-1",
      to_chapter_id: "ch-2",
    });
  });

  it("sends book_download with book_id and format", () => {
    trackReaderEvent({
      name: "book_download",
      properties: {
        book_id: "book-1",
        format: "epub",
        link_url: "https://example.com/a.epub",
        location: "reader",
      },
    });
    expect(track).toHaveBeenCalledWith("book_download", { book_id: "book-1", format: "epub" });
  });

  it("sends reader_audio_started with book and chapter ids", () => {
    trackReaderEvent({
      name: "reader_audio_started",
      properties: { book_id: "book-1", chapter_id: "ch-1" },
    });
    expect(track).toHaveBeenCalledWith("reader_audio_started", {
      book_id: "book-1",
      chapter_id: "ch-1",
    });
  });

  it("sends reading_path_started for questions and trails", () => {
    trackReaderEvent({
      name: "reading_path_started",
      properties: { path_kind: "question", path_id: "q-1" },
    });
    trackReaderEvent({
      name: "reading_path_started",
      properties: { path_kind: "trail", path_id: "t-1" },
    });
    expect(track).toHaveBeenNthCalledWith(1, "reading_path_started", {
      path_kind: "question",
      path_id: "q-1",
    });
    expect(track).toHaveBeenNthCalledWith(2, "reading_path_started", {
      path_kind: "trail",
      path_id: "t-1",
    });
  });

  it("does not throw when Vercel track throws", () => {
    track.mockImplementationOnce(() => {
      throw new Error("offline");
    });
    expect(() =>
      trackReaderEvent({
        name: "chapter_open",
        properties: { book_id: "book-1", chapter_id: "ch-1" },
      }),
    ).not.toThrow();
  });

  it("attaches optional to_id on corpus_navigation (Plus / 8-prop shape)", () => {
    delete process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_PROPERTY_LIMIT;
    trackReaderEvent({
      name: "corpus_navigation",
      properties: {
        from_type: "source",
        to_type: "chapter",
        relation: "related",
        to_id: "chapter-secret",
      },
    });
    expect(track).toHaveBeenCalledWith("corpus_navigation", {
      from_type: "source",
      to_type: "chapter",
      relation: "related",
      to_id: "chapter-secret",
    });
  });

  it("degrades corpus_navigation to edge+to_id when property limit is 2", () => {
    process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_PROPERTY_LIMIT = "2";
    trackReaderEvent({
      name: "corpus_navigation",
      properties: {
        from_type: "source",
        to_type: "chapter",
        relation: "related",
        to_id: "chapter-secret",
      },
    });
    expect(track).toHaveBeenCalledWith("corpus_navigation", {
      edge: "source>chapter",
      to_id: "chapter-secret",
    });
  });

  it("degrades corpus_navigation to edge+relation when limit is 2 and to_id is absent", () => {
    process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_PROPERTY_LIMIT = "2";
    trackReaderEvent({
      name: "corpus_navigation",
      properties: {
        from_type: "source",
        to_type: "thinker",
        relation: "creator",
      },
    });
    expect(track).toHaveBeenCalledWith("corpus_navigation", {
      edge: "source>thinker",
      relation: "creator",
    });
  });
});

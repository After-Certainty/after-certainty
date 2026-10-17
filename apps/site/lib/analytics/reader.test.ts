import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CONSENT_COOKIE_NAME } from "@/lib/consent/constants";
import { setConsent } from "@/lib/consent/storage";
import { trackReaderEvent } from "@/lib/analytics/reader";

const track = vi.fn();
vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => track(...args),
}));

vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: vi.fn(),
}));

import { sendGAEvent } from "@next/third-parties/google";

describe("trackReaderEvent", () => {
  const env = process.env;

  beforeEach(() => {
    track.mockClear();
    vi.mocked(sendGAEvent).mockClear();
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
  });

  afterEach(() => {
    process.env = env;
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
  });

  function productionEnv() {
    process.env = { ...env, NODE_ENV: "production", VERCEL_ENV: "production" };
  }

  it("always sends Vercel chapter_open; skips GA when consent denied", () => {
    productionEnv();
    setConsent("denied");
    trackReaderEvent({
      name: "chapter_open",
      properties: { book_id: "book-1", chapter_id: "ch-1" },
    });
    expect(track).toHaveBeenCalledWith("chapter_open", { book_id: "book-1", chapter_id: "ch-1" });
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("always sends Vercel chapter_open; skips GA when consent unknown", () => {
    productionEnv();
    trackReaderEvent({
      name: "chapter_open",
      properties: { book_id: "book-1", chapter_id: "ch-1" },
    });
    expect(track).toHaveBeenCalledTimes(1);
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("dual-writes chapter_open when consent granted in production", () => {
    productionEnv();
    setConsent("granted");
    trackReaderEvent({
      name: "chapter_open",
      properties: { book_id: "book-1", chapter_id: "ch-1", edition_id: "ed-1" },
    });
    expect(track).toHaveBeenCalledWith("chapter_open", { book_id: "book-1", chapter_id: "ch-1" });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "chapter_open", {
      book_id: "book-1",
      chapter_id: "ch-1",
      edition_id: "ed-1",
    });
  });

  it("sends chapter_advance with destination on Vercel and next_chapter on GA", () => {
    productionEnv();
    setConsent("granted");
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
    expect(sendGAEvent).toHaveBeenCalledWith("event", "next_chapter", {
      book_id: "book-1",
      from_chapter_id: "ch-1",
      to_chapter_id: "ch-2",
    });
  });

  it("dual-writes book_download / file_download", () => {
    productionEnv();
    setConsent("granted");
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
    expect(sendGAEvent).toHaveBeenCalledWith("event", "file_download", {
      file_extension: "epub",
      content_type: "book",
      item_id: "book-1",
      link_url: "https://example.com/a.epub",
      location: "reader",
    });
  });

  it("sends reader_audio_started to Vercel only with book and chapter ids", () => {
    productionEnv();
    setConsent("denied");
    trackReaderEvent({
      name: "reader_audio_started",
      properties: { book_id: "book-1", chapter_id: "ch-1" },
    });
    expect(track).toHaveBeenCalledWith("reader_audio_started", {
      book_id: "book-1",
      chapter_id: "ch-1",
    });
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("dual-writes reading_path_started for questions and trails", () => {
    productionEnv();
    setConsent("granted");
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
    expect(sendGAEvent).toHaveBeenCalledWith("event", "question_path_start", {
      question_id: "q-1",
    });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "trail_path_start", { trail_id: "t-1" });
  });

  it("does not block when Vercel track throws", () => {
    productionEnv();
    setConsent("granted");
    track.mockImplementationOnce(() => {
      throw new Error("offline");
    });
    expect(() =>
      trackReaderEvent({
        name: "chapter_open",
        properties: { book_id: "book-1", chapter_id: "ch-1" },
      }),
    ).not.toThrow();
    expect(sendGAEvent).toHaveBeenCalled();
  });

  it("attaches optional to_id on corpus_navigation without GA dual-write (Plus / 8-prop shape)", () => {
    productionEnv();
    delete process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_PROPERTY_LIMIT;
    setConsent("granted");
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
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("degrades corpus_navigation to edge+to_id when property limit is 2", () => {
    productionEnv();
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
    productionEnv();
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

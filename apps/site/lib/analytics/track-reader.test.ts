import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CONSENT_COOKIE_NAME } from "@/lib/consent/constants";
import { setConsent } from "@/lib/consent/storage";
import { trackChapterOpen, trackNextChapter } from "@/lib/analytics/track-reader";

vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: vi.fn(),
}));

import { sendGAEvent } from "@next/third-parties/google";

describe("track-reader", () => {
  const env = process.env;

  beforeEach(() => {
    vi.mocked(sendGAEvent).mockClear();
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
  });

  afterEach(() => {
    process.env = env;
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
  });

  it("no-ops without analytics consent in production", () => {
    process.env = { ...env, NODE_ENV: "production", VERCEL_ENV: "production" };
    setConsent("denied");
    trackChapterOpen({ book_id: "book-1", chapter_id: "ch-1" });
    trackNextChapter({ book_id: "book-1", from_chapter_id: "ch-1", to_chapter_id: "ch-2" });
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("sends chapter_open and next_chapter when production and consent granted", () => {
    process.env = { ...env, NODE_ENV: "production", VERCEL_ENV: "production" };
    setConsent("granted");

    trackChapterOpen({
      book_id: "book-1",
      chapter_id: "ch-1",
      edition_id: "edition-1",
    });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "chapter_open", {
      book_id: "book-1",
      chapter_id: "ch-1",
      edition_id: "edition-1",
    });

    trackNextChapter({
      book_id: "book-1",
      from_chapter_id: "ch-1",
      to_chapter_id: "ch-2",
    });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "next_chapter", {
      book_id: "book-1",
      from_chapter_id: "ch-1",
      to_chapter_id: "ch-2",
    });
  });
});

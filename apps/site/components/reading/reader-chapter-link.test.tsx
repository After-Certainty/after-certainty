import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReaderChapterLink } from "@/components/reading/reader-chapter-link";

const trackEvent = vi.fn();
const trackNextChapter = vi.fn();
const navigateToChapter = vi.fn();

vi.mock("@/lib/analytics/track", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

vi.mock("@/lib/analytics/track-reader", () => ({
  trackNextChapter: (...args: unknown[]) => trackNextChapter(...args),
}));

vi.mock("@/lib/reading/navigate-chapter", () => ({
  cancelSpokenContent: vi.fn(),
  navigateToChapter: (...args: unknown[]) => navigateToChapter(...args),
}));

describe("ReaderChapterLink", () => {
  it("forces hard navigation and dual-writes next chapter via trackNextChapter", () => {
    trackEvent.mockClear();
    trackNextChapter.mockClear();
    navigateToChapter.mockClear();

    render(
      <ReaderChapterLink
        href="/explore/books/demo/chapters/two"
        analytics={{
          event: "next_chapter",
          params: {
            book_id: "book-1",
            from_chapter_id: "ch-1",
            to_chapter_id: "ch-2",
          },
        }}
      >
        Next
      </ReaderChapterLink>,
    );

    const link = screen.getByRole("link", { name: "Next" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("data-reader-hard-nav", "");
    fireEvent.click(link);
    expect(trackNextChapter).toHaveBeenCalledWith({
      book_id: "book-1",
      from_chapter_id: "ch-1",
      to_chapter_id: "ch-2",
    });
    expect(trackEvent).not.toHaveBeenCalled();
    expect(navigateToChapter).toHaveBeenCalledWith("/explore/books/demo/chapters/two");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReaderChapterLink } from "@/components/reading/reader-chapter-link";

const trackEvent = vi.fn();
const navigateToChapter = vi.fn();

vi.mock("@/lib/analytics/track", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

vi.mock("@/lib/reading/navigate-chapter", () => ({
  cancelSpokenContent: vi.fn(),
  navigateToChapter: (...args: unknown[]) => navigateToChapter(...args),
}));

describe("ReaderChapterLink", () => {
  it("forces hard navigation via navigateToChapter on primary click", () => {
    trackEvent.mockClear();
    navigateToChapter.mockClear();

    render(
      <ReaderChapterLink
        href="/explore/books/demo/chapters/two"
        analytics={{
          event: "next_chapter",
          params: { book_id: "book-1" },
        }}
      >
        Next
      </ReaderChapterLink>,
    );

    const link = screen.getByRole("link", { name: "Next" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("data-reader-hard-nav", "");
    fireEvent.click(link);
    expect(trackEvent).toHaveBeenCalledWith("next_chapter", { book_id: "book-1" });
    expect(navigateToChapter).toHaveBeenCalledWith("/explore/books/demo/chapters/two");
  });
});

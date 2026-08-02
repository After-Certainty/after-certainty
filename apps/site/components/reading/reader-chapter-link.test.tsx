import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReaderChapterLink } from "@/components/reading/reader-chapter-link";

const trackEvent = vi.fn();
const cancelSpokenContent = vi.fn();

vi.mock("@/lib/analytics/track", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

vi.mock("@/lib/reading/navigate-chapter", () => ({
  cancelSpokenContent: (...args: unknown[]) => cancelSpokenContent(...args),
  navigateToChapter: vi.fn(),
}));

describe("ReaderChapterLink", () => {
  it("renders a plain hard-nav anchor and cancels speech on click", () => {
    trackEvent.mockClear();
    cancelSpokenContent.mockClear();

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
    expect(cancelSpokenContent).toHaveBeenCalled();
  });
});

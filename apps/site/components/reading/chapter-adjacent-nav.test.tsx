import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChapterAdjacentNav } from "@/components/reading/chapter-adjacent-nav";

const trackEvent = vi.fn();

vi.mock("@/lib/analytics/track", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

describe("ChapterAdjacentNav", () => {
  it("fires next_chapter analytics when Next is clicked", () => {
    trackEvent.mockClear();
    render(
      <ChapterAdjacentNav
        bookId="book-1"
        fromChapterId="ch-1"
        next={{
          id: "ch-2",
          title: "Chapter Two",
          href: "/explore/books/demo/chapters/two",
          chapterSlug: "two",
          kind: "chapter",
        }}
      />,
    );

    const next = screen.getByRole("link", { name: "Next chapter: Chapter Two" });
    expect(next).toHaveAttribute("href", "/explore/books/demo/chapters/two");
    expect(next).toHaveAttribute("data-reader-hard-nav", "");
    fireEvent.click(next);
    expect(trackEvent).toHaveBeenCalledWith("next_chapter", {
      book_id: "book-1",
      from_chapter_id: "ch-1",
      to_chapter_id: "ch-2",
    });
  });

  it("does not fire analytics for Previous", () => {
    trackEvent.mockClear();
    render(
      <ChapterAdjacentNav
        bookId="book-1"
        fromChapterId="ch-2"
        prev={{
          id: "ch-1",
          title: "Chapter One",
          href: "/explore/books/demo/chapters/one",
          chapterSlug: "one",
          kind: "chapter",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: "Previous chapter: Chapter One" }));
    expect(trackEvent).not.toHaveBeenCalled();
  });
});

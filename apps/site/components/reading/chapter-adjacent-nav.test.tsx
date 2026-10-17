import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChapterAdjacentNav } from "@/components/reading/chapter-adjacent-nav";

const trackNextChapter = vi.fn();
const navigateToChapter = vi.fn();

vi.mock("@/lib/analytics/track-reader", () => ({
  trackNextChapter: (...args: unknown[]) => trackNextChapter(...args),
}));

vi.mock("@/lib/reading/navigate-chapter", () => ({
  cancelSpokenContent: vi.fn(),
  navigateToChapter: (...args: unknown[]) => navigateToChapter(...args),
}));

describe("ChapterAdjacentNav", () => {
  it("fires next_chapter analytics when Next is clicked", () => {
    trackNextChapter.mockClear();
    navigateToChapter.mockClear();
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
    expect(trackNextChapter).toHaveBeenCalledWith({
      book_id: "book-1",
      from_chapter_id: "ch-1",
      to_chapter_id: "ch-2",
    });
  });

  it("does not fire analytics for Previous", () => {
    trackNextChapter.mockClear();
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
    expect(trackNextChapter).not.toHaveBeenCalled();
  });
});

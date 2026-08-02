import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChapterReaderShell } from "@/components/reading/chapter-reader-shell";
import { buildChapterReadingNavigation } from "@/lib/reading/chapter-navigation";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import type { Book } from "@/types/semanticGraph";

const enriched = loadManifestFixture("enriched-book");

vi.mock("@/lib/analytics/track-reader", () => ({
  trackChapterOpen: vi.fn(),
  trackNextChapter: vi.fn(),
}));

function bookWithDownloads(book: Book): Book {
  return {
    ...book,
    epub: {
      enabled: true,
      file: "after-certainty.epub",
      url: "https://example.com/releases/after-certainty.epub",
    },
    pdf: {
      enabled: true,
      file: "after-certainty.pdf",
      url: "https://example.com/releases/after-certainty.pdf",
    },
  };
}

describe("ChapterReaderShell", () => {
  it("renders chapter chrome without fabricating manuscript body", () => {
    const book = enriched.books.find((candidate) => candidate.slug === "after-certainty");
    const chapter = (enriched.chapters ?? []).find(
      (candidate) => candidate.id === "chapter-after-certainty-front-matter-introduction",
    );
    expect(book).toBeTruthy();
    expect(chapter).toBeTruthy();

    render(<ChapterReaderShell book={book!} chapter={chapter!} />);

    expect(screen.getByRole("heading", { level: 1, name: "Introduction" })).toBeInTheDocument();
    expect(screen.getByTestId("reading-progress-chrome")).toBeInTheDocument();
    expect(screen.getByTestId("reader-exit")).toHaveAttribute(
      "href",
      "/explore/books/after-certainty",
    );
    expect(screen.getByRole("link", { name: "Back to book" })).toHaveAttribute(
      "href",
      "/explore/books/after-certainty",
    );
    expect(screen.getByRole("status")).toHaveTextContent(/not on this page yet/i);
    expect(screen.getByText(/Understanding keeps arriving/i)).toBeInTheDocument();
  });

  it("renders TOC and next-chapter link when navigation is provided", () => {
    const book = enriched.books.find((candidate) => candidate.slug === "after-certainty")!;
    const chapter = (enriched.chapters ?? []).find(
      (candidate) => candidate.id === "chapter-after-certainty-front-matter-introduction",
    )!;
    const navigation = buildChapterReadingNavigation({
      graph: enriched,
      book,
      chapterId: chapter.id,
    });
    expect(navigation?.next).toBeTruthy();

    render(
      <ChapterReaderShell book={book} chapter={chapter} navigation={navigation}>
        <p>Manuscript body</p>
      </ChapterReaderShell>,
    );

    expect(screen.getByTestId("chapter-toc-drawer-open")).toBeInTheDocument();
    expect(screen.getByTestId("in-book-search-open")).toBeInTheDocument();
    expect(screen.getByTestId("reader-chapter-position")).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^Chapter \d+ of \d+$/),
    );
    expect(
      screen.getByRole("navigation", { name: "Previous and next chapter", exact: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", {
        name: "Previous and next chapter at end of page",
        exact: true,
      }),
    ).toBeInTheDocument();
    const nextLinks = screen.getAllByRole("link", {
      name: `Next chapter: ${navigation!.next!.title}`,
    });
    expect(nextLinks).toHaveLength(2);
    for (const link of nextLinks) {
      expect(link).toHaveAttribute("href", navigation!.next!.href);
    }
    expect(screen.queryByRole("link", { name: /Previous chapter:/i })).not.toBeInTheDocument();
    expect(screen.getByText("Manuscript body")).toBeInTheDocument();
  });

  it("renders download links when the book has release files", () => {
    const book = bookWithDownloads(
      enriched.books.find((candidate) => candidate.slug === "after-certainty")!,
    );
    const chapter = (enriched.chapters ?? []).find(
      (candidate) => candidate.id === "chapter-after-certainty-front-matter-introduction",
    )!;

    render(<ChapterReaderShell book={book} chapter={chapter} />);

    expect(screen.getByRole("link", { name: "Download EPUB" })).toHaveAttribute(
      "href",
      "https://example.com/releases/after-certainty.epub",
    );
    expect(screen.getByRole("link", { name: "Download PDF" })).toHaveAttribute(
      "href",
      "https://example.com/releases/after-certainty.pdf",
    );
  });

  it("renders provided manuscript children instead of the placeholder", () => {
    const book = enriched.books.find((candidate) => candidate.slug === "after-certainty");
    const chapter = (enriched.chapters ?? [])[0];
    expect(book).toBeTruthy();
    expect(chapter).toBeTruthy();

    render(
      <ChapterReaderShell book={book!} chapter={chapter!}>
        <p>Manuscript body</p>
      </ChapterReaderShell>,
    );

    expect(screen.getByText("Manuscript body")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

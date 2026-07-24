import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChapterReaderShell } from "@/components/reading/chapter-reader-shell";
import { buildChapterReadingNavigation } from "@/lib/reading/chapter-navigation";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";

const enriched = loadManifestFixture("enriched-book");

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

    expect(screen.getByRole("navigation", { name: "Table of contents" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: `Next chapter: ${navigation!.next!.title}` }),
    ).toHaveAttribute("href", navigation!.next!.href);
    expect(screen.queryByRole("link", { name: /Previous chapter:/i })).not.toBeInTheDocument();
    expect(screen.getByText("Manuscript body")).toBeInTheDocument();
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

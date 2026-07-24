import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChapterReaderShell } from "@/components/reading/chapter-reader-shell";
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

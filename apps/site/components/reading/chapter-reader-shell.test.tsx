import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: vi.fn(),
    resolvedTheme: "dark",
  }),
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
    expect(screen.queryByRole("link", { name: "Download EPUB" })).not.toBeInTheDocument();
  });

  it("opens contents drawer from toolbar and shows next-chapter link", async () => {
    const user = userEvent.setup();
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

    expect(screen.getByTestId("reader-chapter-position")).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^Chapter \d+ of \d+$/),
    );
    expect(
      screen.getByRole("navigation", { name: "Previous and next chapter" }),
    ).toBeInTheDocument();
    const nextLink = screen.getByRole("link", {
      name: `Next chapter: ${navigation!.next!.title}`,
    });
    expect(nextLink).toHaveAttribute("href", navigation!.next!.href);
    expect(screen.queryByRole("link", { name: /Previous chapter:/i })).not.toBeInTheDocument();
    expect(screen.getByText("Manuscript body")).toBeInTheDocument();

    await user.click(screen.getByTestId("reader-controls-open"));
    expect(await screen.findByTestId("reader-controls-drawer")).toBeInTheDocument();
    await user.click(screen.getByTestId("reader-tab-contents"));
    expect(screen.getByTestId("chapter-toc-drawer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /The End of Correctness/i })).toBeInTheDocument();
  });

  it("keeps downloads off the reader surface even when formats exist", () => {
    const book = bookWithDownloads(
      enriched.books.find((candidate) => candidate.slug === "after-certainty")!,
    );
    const chapter = (enriched.chapters ?? []).find(
      (candidate) => candidate.id === "chapter-after-certainty-front-matter-introduction",
    )!;

    render(<ChapterReaderShell book={book} chapter={chapter} />);

    expect(screen.queryByRole("link", { name: "Download EPUB" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Download PDF" })).not.toBeInTheDocument();
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

  it("docks available chapter audio at the bottom without a Listen CTA", () => {
    const book = enriched.books.find((candidate) => candidate.slug === "after-certainty")!;
    const chapter = (enriched.chapters ?? []).find(
      (candidate) => candidate.id === "chapter-after-certainty-front-matter-introduction",
    )!;

    render(
      <ChapterReaderShell
        book={book}
        chapter={chapter}
        chapterAudio={{
          unitId: chapter.id,
          editionSlug: "after-certainty",
          chapterSlug: "front-matter-introduction",
          routeKey: chapter.routeKey,
          audioUrl: "/generated/audio/after-certainty/front-matter-introduction.mp3",
          durationSeconds: 10,
          alignmentUrl: null,
          alignmentGranularity: "none",
          generationHash: `sha256:${"e".repeat(64)}`,
          disclosure: "AI-generated narration",
        }}
      />,
    );

    const dock = screen.getByTestId("chapter-audio-player");
    expect(dock).toHaveAttribute("data-unit-id", chapter.id);
    expect(screen.getByRole("region", { name: "Chapter audio" })).toBeInTheDocument();
    expect(screen.getByTestId("chapter-audio-element")).toBeInTheDocument();
    expect(screen.queryByTestId("chapter-audio-listen")).not.toBeInTheDocument();
    expect(document.querySelector("[data-chapter-audio='dock']")).toBeTruthy();
  });
});

import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InBookSearch } from "@/components/reading/in-book-search";
import { resetSearchIndexCacheForTests } from "@/components/search/use-search-index";
import type { SearchIndexPayload } from "@/lib/search/indexPayload";

const navigateToChapter = vi.fn();

vi.mock("@/lib/reading/navigate-chapter", () => ({
  navigateToChapter: (...args: unknown[]) => navigateToChapter(...args),
  cancelSpokenContent: vi.fn(),
}));

vi.mock("@/lib/analytics/track", () => ({
  trackSearchQuery: vi.fn(),
  trackSearchNoResults: vi.fn(),
  trackSearchSelect: vi.fn(),
}));

function payload(): SearchIndexPayload {
  return {
    version: 1,
    generatedAt: "2026-07-19T00:00:00.000Z",
    documentCount: 4,
    aliasConfig: { version: 1, entries: [] },
    documents: [
      {
        id: "chapter-after-certainty-1",
        entityType: "chapter",
        slug: "chapter-1",
        title: "The End of Correctness",
        description: "When explanation stops being enough.",
        resultLabel: "Chapter",
        canonicalUrl: "/explore/books/after-certainty/chapters/chapter-1",
        visibility: "listed",
        contextLabel: "Chapter in After Certainty",
        searchText: "The End of Correctness\nWhen explanation stops being enough.\nAfter Certainty",
        aliases: [],
        bookIds: ["book-after-certainty"],
        boostWeight: 1,
        sourceArtifact: "semantic",
      },
      {
        id: "chapter-other-book-1",
        entityType: "chapter",
        slug: "chapter-1",
        title: "Correctness in another book",
        description: "Should not appear in After Certainty search.",
        resultLabel: "Chapter",
        canonicalUrl: "/explore/books/other/chapters/chapter-1",
        visibility: "listed",
        contextLabel: "Chapter in Other",
        searchText: "Correctness in another book",
        aliases: [],
        bookIds: ["book-other"],
        boostWeight: 1,
        sourceArtifact: "semantic",
      },
      {
        id: "concept-correctness",
        entityType: "concept",
        slug: "correctness",
        title: "Correctness",
        description: "A global concept hit.",
        resultLabel: "Concept",
        canonicalUrl: "/explore/concepts/correctness",
        visibility: "listed",
        searchText: "Correctness\nA global concept hit.",
        aliases: [],
        boostWeight: 1.2,
        sourceArtifact: "semantic",
      },
      {
        id: "book-after-certainty",
        entityType: "book",
        slug: "after-certainty",
        title: "After Certainty",
        description: "Book doc should not appear in chapter-scoped search.",
        resultLabel: "Book",
        canonicalUrl: "/explore/books/after-certainty",
        visibility: "listed",
        searchText: "After Certainty\nCorrectness",
        aliases: [],
        bookIds: ["book-after-certainty"],
        boostWeight: 1.3,
        sourceArtifact: "semantic",
      },
    ],
  };
}

describe("InBookSearch", () => {
  beforeEach(() => {
    resetSearchIndexCacheForTests();
    navigateToChapter.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => payload(),
      }),
    );
  });

  it("opens a dialog and returns only chapters for the edition", async () => {
    const user = userEvent.setup();
    render(<InBookSearch editionId="book-after-certainty" bookTitle="After Certainty" />);

    await user.click(screen.getByTestId("in-book-search-open"));
    const dialog = await screen.findByTestId("in-book-search-dialog");
    expect(dialog).toHaveAttribute("role", "dialog");

    const input = within(dialog).getByTestId("in-book-search-input");
    await user.type(input, "correctness");

    await waitFor(() => {
      const results = within(dialog).getAllByTestId("in-book-search-result");
      expect(results).toHaveLength(1);
      expect(results[0]).toHaveTextContent("The End of Correctness");
    });

    expect(within(dialog).queryByText(/another book/i)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/global concept/i)).not.toBeInTheDocument();
  });

  it("shows a clear empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<InBookSearch editionId="book-after-certainty" bookTitle="After Certainty" />);

    await user.click(screen.getByTestId("in-book-search-open"));
    const dialog = await screen.findByTestId("in-book-search-dialog");
    await user.type(within(dialog).getByTestId("in-book-search-input"), "zzzz-no-match");

    await waitFor(() => {
      expect(within(dialog).getByText(/No chapters match in this book/i)).toBeInTheDocument();
    });
  });

  it("restores focus to the trigger after Escape", async () => {
    const user = userEvent.setup();
    render(<InBookSearch editionId="book-after-certainty" bookTitle="After Certainty" />);

    const trigger = screen.getByTestId("in-book-search-open");
    await user.click(trigger);
    await screen.findByTestId("in-book-search-dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByTestId("in-book-search-dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it("does not close a parent Radix drawer on Escape while search is open", async () => {
    const user = userEvent.setup();
    const { ReaderDrawer } = await import("@/components/reading/reader-drawer");

    function Nested() {
      const [open, setOpen] = useState(true);
      return (
        <ReaderDrawer
          open={open}
          onOpenChange={setOpen}
          title="Settings"
          description="Reader settings"
          contentTestId="reader-controls-drawer"
        >
          <InBookSearch
            editionId="book-after-certainty"
            bookTitle="After Certainty"
            variant="readerCompact"
          />
        </ReaderDrawer>
      );
    }

    render(<Nested />);
    expect(await screen.findByTestId("reader-controls-drawer")).toBeInTheDocument();

    const trigger = screen.getByTestId("in-book-search-open");
    await user.click(trigger);
    await screen.findByTestId("in-book-search-dialog");
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByTestId("in-book-search-dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("reader-controls-drawer")).toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  BookmarksForBook,
  ChapterBookmarkControl,
} from "@/components/reading/reading-bookmarks-panel";
import { buildContinueReadingCatalog } from "@/lib/reading/continueReading";
import {
  addReadingBookmark,
  hasReadingBookmark,
  READING_BOOKMARKS_STORAGE_KEY,
} from "@/lib/reading/readingBookmarks";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";

const enriched = loadManifestFixture("enriched-book");
const catalog = buildContinueReadingCatalog(enriched);
const EDITION = "book-after-certainty";
const CHAPTER = "chapter-after-certainty-front-matter-introduction";

describe("reading bookmarks panel", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("toggles a chapter bookmark from reader chrome", async () => {
    const user = userEvent.setup();
    render(
      <ChapterBookmarkControl
        editionId={EDITION}
        chapterId={CHAPTER}
        chapterTitle="Introduction"
      />,
    );

    const button = await screen.findByTestId("chapter-bookmark-control");
    expect(button).toHaveTextContent("Bookmark chapter");

    await user.click(button);
    expect(hasReadingBookmark(EDITION, CHAPTER)).toBe(true);
    expect(button).toHaveTextContent("Remove bookmark");

    await user.click(button);
    expect(hasReadingBookmark(EDITION, CHAPTER)).toBe(false);
    expect(button).toHaveTextContent("Bookmark chapter");
  });

  it("bookmarks the current section when a hash is present", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/#opening");
    render(
      <ChapterBookmarkControl
        editionId={EDITION}
        chapterId={CHAPTER}
        chapterTitle="Introduction"
      />,
    );

    const button = await screen.findByTestId("chapter-bookmark-control");
    expect(button).toHaveTextContent("Bookmark section");
    await user.click(button);
    expect(hasReadingBookmark(EDITION, CHAPTER, "opening")).toBe(true);
  });

  it("lists bookmarks on the book page and removes them", async () => {
    const user = userEvent.setup();
    addReadingBookmark({
      editionId: EDITION,
      chapterId: CHAPTER,
      label: "Introduction",
    });

    render(<BookmarksForBook editionId={EDITION} catalog={catalog} />);

    expect(await screen.findByTestId("bookmarks-for-book")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Introduction" })).toHaveAttribute(
      "href",
      "/explore/books/after-certainty/chapters/front-matter-introduction",
    );

    await user.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => {
      expect(screen.queryByTestId("bookmarks-for-book")).not.toBeInTheDocument();
    });
    expect(window.localStorage.getItem(READING_BOOKMARKS_STORAGE_KEY)).not.toContain(CHAPTER);
  });

  it("hides the book list when there are no bookmarks", async () => {
    const { container } = render(<BookmarksForBook editionId={EDITION} catalog={catalog} />);
    await waitFor(() => {
      expect(screen.queryByTestId("bookmarks-for-book")).not.toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    });
  });
});

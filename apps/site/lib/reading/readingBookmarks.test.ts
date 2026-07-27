import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  addReadingBookmark,
  chapterBookmarkStorageKey,
  clearAllReadingBookmarks,
  clearReadingBookmarksForEdition,
  getReadingBookmark,
  hasReadingBookmark,
  listReadingBookmarks,
  listReadingBookmarksForEdition,
  READING_BOOKMARKS_STORAGE_KEY,
  removeReadingBookmark,
  toggleReadingBookmark,
} from "@/lib/reading/readingBookmarks";

const EDITION = "book-after-certainty";
const CHAPTER = "chapter-after-certainty-front-matter-introduction";

describe("readingBookmarks", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("builds contract identity keys with optional fragment", () => {
    expect(chapterBookmarkStorageKey(EDITION, CHAPTER)).toBe(`bookmark:${EDITION}:${CHAPTER}`);
    expect(chapterBookmarkStorageKey(EDITION, CHAPTER, "#opening")).toBe(
      `bookmark:${EDITION}:${CHAPTER}:opening`,
    );
  });

  it("adds and reads chapter bookmarks", () => {
    const entry = addReadingBookmark({
      editionId: EDITION,
      chapterId: CHAPTER,
      label: "Introduction",
    });

    expect(entry.identityKey).toBe(`bookmark:${EDITION}:${CHAPTER}`);
    expect(entry.label).toBe("Introduction");
    expect(hasReadingBookmark(EDITION, CHAPTER)).toBe(true);
    expect(getReadingBookmark(EDITION, CHAPTER)?.chapterId).toBe(CHAPTER);
    expect(window.localStorage.getItem(READING_BOOKMARKS_STORAGE_KEY)).toContain(EDITION);
  });

  it("stores section bookmarks separately from chapter bookmarks", () => {
    addReadingBookmark({ editionId: EDITION, chapterId: CHAPTER, label: "Introduction" });
    addReadingBookmark({
      editionId: EDITION,
      chapterId: CHAPTER,
      fragmentId: "section-one",
      label: "Section one",
    });

    expect(listReadingBookmarks()).toHaveLength(2);
    expect(hasReadingBookmark(EDITION, CHAPTER)).toBe(true);
    expect(hasReadingBookmark(EDITION, CHAPTER, "section-one")).toBe(true);
  });

  it("toggles bookmarks on and off", () => {
    expect(toggleReadingBookmark({ editionId: EDITION, chapterId: CHAPTER }).bookmarked).toBe(
      true,
    );
    expect(hasReadingBookmark(EDITION, CHAPTER)).toBe(true);
    expect(toggleReadingBookmark({ editionId: EDITION, chapterId: CHAPTER }).bookmarked).toBe(
      false,
    );
    expect(hasReadingBookmark(EDITION, CHAPTER)).toBe(false);
  });

  it("lists newest first and filters by edition", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-07-27T12:00:00.000Z"));
      addReadingBookmark({ editionId: EDITION, chapterId: CHAPTER, label: "Older" });
      vi.setSystemTime(new Date("2026-07-27T12:00:01.000Z"));
      addReadingBookmark({
        editionId: "book-other",
        chapterId: "chapter-other",
        label: "Other",
      });
      vi.setSystemTime(new Date("2026-07-27T12:00:02.000Z"));
      addReadingBookmark({
        editionId: EDITION,
        chapterId: CHAPTER,
        fragmentId: "later",
        label: "Newer section",
      });

      const all = listReadingBookmarks();
      expect(all[0]?.fragmentId).toBe("later");
      expect(listReadingBookmarksForEdition(EDITION)).toHaveLength(2);
      expect(listReadingBookmarksForEdition("book-other")).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("removes and clears bookmarks", () => {
    addReadingBookmark({ editionId: EDITION, chapterId: CHAPTER });
    addReadingBookmark({
      editionId: EDITION,
      chapterId: CHAPTER,
      fragmentId: "opening",
    });
    addReadingBookmark({ editionId: "book-other", chapterId: "chapter-other" });

    removeReadingBookmark(EDITION, CHAPTER, "opening");
    expect(hasReadingBookmark(EDITION, CHAPTER, "opening")).toBe(false);
    expect(hasReadingBookmark(EDITION, CHAPTER)).toBe(true);

    clearReadingBookmarksForEdition(EDITION);
    expect(listReadingBookmarksForEdition(EDITION)).toHaveLength(0);
    expect(hasReadingBookmark("book-other", "chapter-other")).toBe(true);

    clearAllReadingBookmarks();
    expect(listReadingBookmarks()).toHaveLength(0);
    expect(window.localStorage.getItem(READING_BOOKMARKS_STORAGE_KEY)).toBeNull();
  });

  it("throws when adding without ids", () => {
    expect(() => addReadingBookmark({ editionId: "", chapterId: CHAPTER })).toThrow(/non-empty/);
  });
});

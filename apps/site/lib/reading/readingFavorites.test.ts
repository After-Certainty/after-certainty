import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  addFavoriteBook,
  clearAllReadingFavorites,
  isFavoriteBook,
  listFavoriteBookIds,
  READING_FAVORITES_STORAGE_KEY,
  removeFavoriteBook,
  toggleFavoriteBook,
} from "@/lib/reading/readingFavorites";
import { readVersionedLocalState } from "@/lib/storage/safe-local-storage";

describe("readingFavorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("toggles favorites and persists a versioned envelope", () => {
    expect(toggleFavoriteBook("book-a").favorited).toBe(true);
    expect(isFavoriteBook("book-a")).toBe(true);
    expect(listFavoriteBookIds()).toEqual(["book-a"]);

    const stored = readVersionedLocalState<{ bookIds: string[] }>(READING_FAVORITES_STORAGE_KEY, 1);
    expect(stored?.data.bookIds).toEqual(["book-a"]);

    expect(toggleFavoriteBook("book-a").favorited).toBe(false);
    expect(isFavoriteBook("book-a")).toBe(false);
  });

  it("dedupes ids and supports clear", () => {
    addFavoriteBook("book-a");
    addFavoriteBook("book-a");
    addFavoriteBook("book-b");
    expect(listFavoriteBookIds()).toEqual(["book-a", "book-b"]);
    removeFavoriteBook("book-a");
    expect(listFavoriteBookIds()).toEqual(["book-b"]);
    clearAllReadingFavorites();
    expect(window.localStorage.getItem(READING_FAVORITES_STORAGE_KEY)).toBeNull();
    expect(listFavoriteBookIds()).toEqual([]);
  });
});

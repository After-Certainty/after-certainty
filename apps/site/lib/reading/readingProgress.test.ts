import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { chapterReadingStorageKey } from "@/lib/graph/chapters";
import {
  clearAllReadingProgress,
  clearReadingProgress,
  getReadingProgress,
  listReadingProgress,
  READING_PROGRESS_STORAGE_KEY,
  recordReadingProgress,
} from "@/lib/reading/readingProgress";
import { readVersionedLocalState } from "@/lib/storage/safe-local-storage";

const EDITION = "book-after-certainty";
const CHAPTER_INTRO = "chapter-after-certainty-front-matter-introduction";
const CHAPTER_2 = "chapter-after-certainty-parts-part-1-chapter-1";

describe("readingProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("records and reads last chapter for an edition", () => {
    const entry = recordReadingProgress({
      editionId: EDITION,
      chapterId: CHAPTER_INTRO,
    });

    expect(entry.editionId).toBe(EDITION);
    expect(entry.chapterId).toBe(CHAPTER_INTRO);
    expect(entry.identityKey).toBe(chapterReadingStorageKey(EDITION, CHAPTER_INTRO));
    expect(entry.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const progress = getReadingProgress(EDITION);
    expect(progress?.chapterId).toBe(CHAPTER_INTRO);
    expect(window.localStorage.getItem(READING_PROGRESS_STORAGE_KEY)).toContain(EDITION);
  });

  it("overwrites last chapter when visiting another unit in the same edition", () => {
    recordReadingProgress({ editionId: EDITION, chapterId: CHAPTER_INTRO });
    recordReadingProgress({
      editionId: EDITION,
      chapterId: CHAPTER_2,
      fragmentId: "section-one",
      scrollY: 420,
    });

    const progress = getReadingProgress(EDITION);
    expect(progress?.chapterId).toBe(CHAPTER_2);
    expect(progress?.fragmentId).toBe("section-one");
    expect(progress?.scrollY).toBe(420);
    expect(progress?.identityKey).toBe(chapterReadingStorageKey(EDITION, CHAPTER_2));
  });

  it("keeps fragment and scroll when re-recording the same chapter without those fields", () => {
    recordReadingProgress({
      editionId: EDITION,
      chapterId: CHAPTER_INTRO,
      fragmentId: "opening",
      scrollY: 100,
    });
    recordReadingProgress({ editionId: EDITION, chapterId: CHAPTER_INTRO });

    const progress = getReadingProgress(EDITION);
    expect(progress?.fragmentId).toBe("opening");
    expect(progress?.scrollY).toBe(100);
  });

  it("clears fragment and scroll when explicitly set to null", () => {
    recordReadingProgress({
      editionId: EDITION,
      chapterId: CHAPTER_INTRO,
      fragmentId: "opening",
      scrollY: 100,
    });
    recordReadingProgress({
      editionId: EDITION,
      chapterId: CHAPTER_INTRO,
      fragmentId: null,
      scrollY: null,
    });

    const progress = getReadingProgress(EDITION);
    expect(progress?.fragmentId).toBeUndefined();
    expect(progress?.scrollY).toBeUndefined();
  });

  it("clears fragment and scroll when switching chapters unless new values are provided", () => {
    recordReadingProgress({
      editionId: EDITION,
      chapterId: CHAPTER_INTRO,
      fragmentId: "opening",
      scrollY: 100,
    });
    recordReadingProgress({ editionId: EDITION, chapterId: CHAPTER_2 });

    const progress = getReadingProgress(EDITION);
    expect(progress?.chapterId).toBe(CHAPTER_2);
    expect(progress?.fragmentId).toBeUndefined();
    expect(progress?.scrollY).toBeUndefined();
  });

  it("normalizes fragment hashes and non-finite scroll", () => {
    const entry = recordReadingProgress({
      editionId: EDITION,
      chapterId: CHAPTER_INTRO,
      fragmentId: "#my-heading",
      scrollY: Number.NaN,
    });
    expect(entry.fragmentId).toBe("my-heading");
    expect(entry.scrollY).toBeUndefined();
  });

  it("lists progress newest first across editions", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-07-27T12:00:00.000Z"));
      recordReadingProgress({
        editionId: "book-a",
        chapterId: "chapter-a-1",
      });
      vi.setSystemTime(new Date("2026-07-27T12:00:01.000Z"));
      recordReadingProgress({
        editionId: "book-b",
        chapterId: "chapter-b-1",
      });

      const listed = listReadingProgress();
      expect(listed).toHaveLength(2);
      expect(listed[0]?.editionId).toBe("book-b");
      expect(listed[1]?.editionId).toBe("book-a");
    } finally {
      vi.useRealTimers();
    }
  });

  it("clears stored progress for one edition", () => {
    recordReadingProgress({ editionId: EDITION, chapterId: CHAPTER_INTRO });
    recordReadingProgress({ editionId: "book-other", chapterId: "chapter-other" });
    clearReadingProgress(EDITION);

    expect(getReadingProgress(EDITION)).toBeNull();
    expect(getReadingProgress("book-other")?.chapterId).toBe("chapter-other");
  });

  it("clears all progress", () => {
    recordReadingProgress({ editionId: EDITION, chapterId: CHAPTER_INTRO });
    clearAllReadingProgress();
    expect(getReadingProgress(EDITION)).toBeNull();
    expect(window.localStorage.getItem(READING_PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it("migrates legacy bare progress maps into a versioned envelope", () => {
    const legacyEntry = {
      editionId: EDITION,
      chapterId: CHAPTER_INTRO,
      identityKey: chapterReadingStorageKey(EDITION, CHAPTER_INTRO),
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    window.localStorage.setItem(
      READING_PROGRESS_STORAGE_KEY,
      JSON.stringify({ [EDITION]: legacyEntry }),
    );
    expect(getReadingProgress(EDITION)?.chapterId).toBe(CHAPTER_INTRO);
    expect(readVersionedLocalState(READING_PROGRESS_STORAGE_KEY, 1)?.data).toMatchObject({
      [EDITION]: expect.objectContaining({ chapterId: CHAPTER_INTRO }),
    });
  });

  it("returns null and no-ops when storage is empty or edition id blank", () => {
    expect(getReadingProgress(EDITION)).toBeNull();
    expect(getReadingProgress("")).toBeNull();
    clearReadingProgress("");
    expect(listReadingProgress()).toEqual([]);
  });

  it("throws when recording without edition or chapter id", () => {
    expect(() => recordReadingProgress({ editionId: "", chapterId: CHAPTER_INTRO })).toThrow(
      /non-empty/,
    );
    expect(() => recordReadingProgress({ editionId: EDITION, chapterId: "  " })).toThrow(
      /non-empty/,
    );
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildContinueReadingCatalog } from "@/lib/reading/continueReading";
import { addReadingBookmark } from "@/lib/reading/readingBookmarks";
import {
  bookmarkDisplayLabel,
  resolveReadingBookmarkTarget,
  resolveReadingBookmarkTargets,
} from "@/lib/reading/resolveReadingBookmarks";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";

const enriched = loadManifestFixture("enriched-book");
const catalog = buildContinueReadingCatalog(enriched);
const EDITION = "book-after-certainty";
const CHAPTER = "chapter-after-certainty-front-matter-introduction";

describe("resolveReadingBookmarks", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("resolves chapter and section bookmarks to live hrefs", () => {
    const chapter = addReadingBookmark({
      editionId: EDITION,
      chapterId: CHAPTER,
      label: "Introduction",
    });
    const section = addReadingBookmark({
      editionId: EDITION,
      chapterId: CHAPTER,
      fragmentId: "opening",
      label: "Opening",
    });

    expect(resolveReadingBookmarkTarget(chapter, catalog)?.href).toBe(
      "/explore/books/after-certainty/chapters/front-matter-introduction",
    );
    expect(resolveReadingBookmarkTarget(section, catalog)?.href).toBe(
      "/explore/books/after-certainty/chapters/front-matter-introduction#opening",
    );
    expect(bookmarkDisplayLabel(resolveReadingBookmarkTarget(section, catalog)!)).toBe("Opening");
  });

  it("drops stale bookmarks and keeps valid ones", () => {
    const valid = addReadingBookmark({ editionId: EDITION, chapterId: CHAPTER });
    const stale = {
      ...valid,
      chapterId: "chapter-missing",
      identityKey: `bookmark:${EDITION}:chapter-missing`,
    };

    const targets = resolveReadingBookmarkTargets([stale, valid], catalog);
    expect(targets).toHaveLength(1);
    expect(targets[0]?.chapterId).toBe(CHAPTER);
  });
});

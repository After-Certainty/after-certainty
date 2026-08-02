import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RecordReadingProgress } from "@/components/reading/record-reading-progress";
import { getReadingProgress, READING_PROGRESS_STORAGE_KEY } from "@/lib/reading/readingProgress";

const EDITION = "book-after-certainty";
const CHAPTER = "chapter-after-certainty-front-matter-introduction";

describe("RecordReadingProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.scrollTo = vi.fn();
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("records progress on mount using edition and chapter ids", () => {
    render(<RecordReadingProgress editionId={EDITION} chapterId={CHAPTER} />);

    const progress = getReadingProgress(EDITION);
    expect(progress?.chapterId).toBe(CHAPTER);
    expect(progress?.identityKey).toBe(`readingProgress:${EDITION}:${CHAPTER}`);
    expect(window.localStorage.getItem(READING_PROGRESS_STORAGE_KEY)).toContain(EDITION);
  });

  it("captures location hash as fragmentId", () => {
    window.history.replaceState(null, "", "/#section-two");
    render(<RecordReadingProgress editionId={EDITION} chapterId={CHAPTER} />);

    expect(getReadingProgress(EDITION)?.fragmentId).toBe("section-two");
  });
});

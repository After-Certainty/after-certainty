import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RestoreReadingScroll } from "@/components/reading/restore-reading-scroll";
import { recordReadingProgress } from "@/lib/reading/readingProgress";

const EDITION = "book-after-certainty";
const CHAPTER = "chapter-after-certainty-front-matter-introduction";

describe("RestoreReadingScroll", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/explore/books/after-certainty/chapters/intro");
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("restores stored scrollY when there is no hash", () => {
    recordReadingProgress({
      editionId: EDITION,
      chapterId: CHAPTER,
      scrollY: 420,
    });
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

    render(<RestoreReadingScroll editionId={EDITION} chapterId={CHAPTER} />);

    expect(scrollTo).toHaveBeenCalledWith({ top: 420, left: 0, behavior: "auto" });
  });

  it("skips restore when a fragment hash is present", () => {
    recordReadingProgress({
      editionId: EDITION,
      chapterId: CHAPTER,
      fragmentId: "opening",
      scrollY: 420,
    });
    window.history.replaceState(null, "", "/explore/books/after-certainty/chapters/intro#opening");
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

    render(<RestoreReadingScroll editionId={EDITION} chapterId={CHAPTER} />);

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("does not restore for a different chapter", () => {
    recordReadingProgress({
      editionId: EDITION,
      chapterId: "chapter-other",
      scrollY: 420,
    });
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);

    act(() => {
      render(<RestoreReadingScroll editionId={EDITION} chapterId={CHAPTER} />);
    });

    expect(scrollTo).not.toHaveBeenCalled();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { cancelSpokenContent, navigateToChapter } from "@/lib/reading/navigate-chapter";

describe("navigate-chapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("cancels speechSynthesis when available", () => {
    const cancel = vi.fn();
    vi.stubGlobal("speechSynthesis", { cancel });
    cancelSpokenContent();
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("swallows speechSynthesis errors", () => {
    vi.stubGlobal("speechSynthesis", {
      cancel: () => {
        throw new Error("unavailable");
      },
    });
    expect(() => cancelSpokenContent()).not.toThrow();
  });

  it("assigns window.location for chapter navigation", () => {
    const cancel = vi.fn();
    const assign = vi.fn();
    vi.stubGlobal("speechSynthesis", { cancel });
    vi.stubGlobal("location", { assign });
    navigateToChapter("/explore/books/demo/chapters/two");
    expect(cancel).toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith("/explore/books/demo/chapters/two");
  });
});

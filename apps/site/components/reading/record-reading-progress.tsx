"use client";

import { useEffect } from "react";

import { recordReadingProgress } from "@/lib/reading/readingProgress";

const SCROLL_DEBOUNCE_MS = 400;

type RecordReadingProgressProps = {
  editionId: string;
  chapterId: string;
};

/**
 * Client-only side effect: persist last chapter (+ optional hash / scroll) in localStorage.
 * Renders nothing. No server sync (READ-011).
 */
export function RecordReadingProgress({ editionId, chapterId }: RecordReadingProgressProps) {
  useEffect(() => {
    const fragmentFromHash = () => {
      if (typeof window === "undefined") return undefined;
      const raw = window.location.hash.replace(/^#/, "").trim();
      return raw.length > 0 ? raw : undefined;
    };

    recordReadingProgress({
      editionId,
      chapterId,
      fragmentId: fragmentFromHash() ?? null,
      // Omit scrollY on mount so a top-of-page load does not wipe a prior offset
      // until the reader scrolls or leaves the page.
    });

    let timer: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        recordReadingProgress({
          editionId,
          chapterId,
          scrollY: window.scrollY,
        });
      }, SCROLL_DEBOUNCE_MS);
    };

    const onHashChange = () => {
      recordReadingProgress({
        editionId,
        chapterId,
        fragmentId: fragmentFromHash() ?? null,
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onHashChange);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHashChange);
      // Final snapshot so a quick exit still keeps approximate position.
      recordReadingProgress({
        editionId,
        chapterId,
        fragmentId: fragmentFromHash() ?? null,
        scrollY: window.scrollY,
      });
    };
  }, [editionId, chapterId]);

  return null;
}

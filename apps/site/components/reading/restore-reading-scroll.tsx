"use client";

import { useEffect, useRef } from "react";

import { getReadingProgress } from "@/lib/reading/readingProgress";

type RestoreReadingScrollProps = {
  editionId: string;
  chapterId: string;
};

/**
 * Soft restore of stored `scrollY` when landing on a chapter without a hash fragment.
 * Fragment/hash navigation wins. Honors prefers-reduced-motion (always uses instant scroll).
 * Persist-only scroll offsets become product-visible continue-reading polish (Phase G).
 */
export function RestoreReadingScroll({ editionId, chapterId }: RestoreReadingScrollProps) {
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    if (typeof window === "undefined") return;
    if (window.location.hash.replace(/^#/, "").trim()) return;

    const entry = getReadingProgress(editionId);
    if (!entry || entry.chapterId !== chapterId) return;
    if (typeof entry.scrollY !== "number" || entry.scrollY <= 0) return;

    restoredRef.current = true;
    const targetY = entry.scrollY;

    // Wait a frame so manuscript layout can settle; always instant (no smooth scroll fight).
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [editionId, chapterId]);

  return null;
}

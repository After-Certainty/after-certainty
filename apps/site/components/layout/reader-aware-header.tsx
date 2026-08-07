"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { isPatternChallengePlayPath } from "@/lib/games/is-pattern-challenge-play-path";
import { isChapterReaderPath } from "@/lib/reading/is-chapter-reader-path";

/**
 * Omits the standard site header on chapter reader routes and Pattern Recognition play.
 * Paired with the (reader) route group so the reading surface is not Explore chrome.
 */
export function ReaderAwareHeader({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isChapterReaderPath(pathname) || isPatternChallengePlayPath(pathname)) return null;
  return children;
}

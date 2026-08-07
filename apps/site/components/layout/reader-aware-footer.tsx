"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { isPatternChallengePlayPath } from "@/lib/games/is-pattern-challenge-play-path";
import { isChapterReaderPath } from "@/lib/reading/is-chapter-reader-path";

/**
 * Omits site footer on chapter reader routes and Pattern Recognition play.
 * Server footer is passed as children so async SiteFooter stays a Server Component.
 */
export function ReaderAwareFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isChapterReaderPath(pathname) || isPatternChallengePlayPath(pathname)) return null;
  return children;
}

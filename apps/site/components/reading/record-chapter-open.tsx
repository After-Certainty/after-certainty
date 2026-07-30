"use client";

import { useEffect } from "react";

import { trackChapterOpen } from "@/lib/analytics/track-reader";

type RecordChapterOpenProps = {
  bookId: string;
  chapterId: string;
  editionId?: string;
};

/**
 * Client-only: fire chapter_open once per chapter mount (ANALYTICS-001).
 * Consent-gated via trackEvent; no manuscript text.
 */
export function RecordChapterOpen({ bookId, chapterId, editionId }: RecordChapterOpenProps) {
  useEffect(() => {
    trackChapterOpen({
      book_id: bookId,
      chapter_id: chapterId,
      ...(editionId ? { edition_id: editionId } : {}),
    });
  }, [bookId, chapterId, editionId]);

  return null;
}

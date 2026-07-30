import type { ChapterOpenParams, NextChapterParams } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";

/** Native reader chapter view — fire once per mount (ANALYTICS-001). */
export function trackChapterOpen(params: ChapterOpenParams): void {
  trackEvent("chapter_open", params);
}

/** Native reader next-chapter control (ANALYTICS-001). */
export function trackNextChapter(params: NextChapterParams): void {
  trackEvent("next_chapter", params);
}

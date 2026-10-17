import type { ChapterOpenParams, NextChapterParams } from "@/lib/analytics/events";
import { trackReaderEvent } from "@/lib/analytics/reader";

/** Native reader chapter view — fire once per mount (ANALYTICS-001). Dual-writes GA + Vercel. */
export function trackChapterOpen(params: ChapterOpenParams): void {
  trackReaderEvent({
    name: "chapter_open",
    properties: {
      book_id: params.book_id,
      chapter_id: params.chapter_id,
      ...(params.edition_id ? { edition_id: params.edition_id } : {}),
    },
  });
}

/** Native reader next-chapter control (ANALYTICS-001). Dual-writes GA `next_chapter` + Vercel `chapter_advance`. */
export function trackNextChapter(params: NextChapterParams): void {
  trackReaderEvent({
    name: "chapter_advance",
    properties: {
      book_id: params.book_id,
      from_chapter_id: params.from_chapter_id,
      to_chapter_id: params.to_chapter_id,
    },
  });
}

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RecordChapterOpen } from "@/components/reading/record-chapter-open";

const trackChapterOpen = vi.fn();

vi.mock("@/lib/analytics/track-reader", () => ({
  trackChapterOpen: (...args: unknown[]) => trackChapterOpen(...args),
}));

describe("RecordChapterOpen", () => {
  it("fires chapter_open once on mount with IDs only", () => {
    trackChapterOpen.mockClear();
    render(<RecordChapterOpen bookId="book-1" chapterId="ch-1" editionId="edition-1" />);
    expect(trackChapterOpen).toHaveBeenCalledTimes(1);
    expect(trackChapterOpen).toHaveBeenCalledWith({
      book_id: "book-1",
      chapter_id: "ch-1",
      edition_id: "edition-1",
    });
  });
});

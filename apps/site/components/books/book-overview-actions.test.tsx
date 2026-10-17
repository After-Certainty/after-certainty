import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  BookOverviewActions,
  fileExtensionFromUrl,
  trackBookOverviewDownload,
} from "@/components/books/book-overview-actions";

const trackReaderEvent = vi.fn();
const trackEvent = vi.fn();

vi.mock("@/lib/analytics/reader", () => ({
  trackReaderEvent: (...args: unknown[]) => trackReaderEvent(...args),
}));

vi.mock("@/lib/analytics/track", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

vi.mock("@/components/reading/book-favorite-control", () => ({
  BookFavoriteControl: () => null,
}));

vi.mock("@/components/explore/explore-observatory-focus-link", () => ({
  ExploreObservatoryFocusLink: () => null,
}));

describe("fileExtensionFromUrl", () => {
  it("normalizes epub/pdf extensions", () => {
    expect(fileExtensionFromUrl("https://cdn.example.com/book.EPUB")).toBe("epub");
    expect(fileExtensionFromUrl("https://cdn.example.com/path/book.pdf")).toBe("pdf");
  });
});

describe("BookOverviewActions downloads", () => {
  beforeEach(() => {
    trackReaderEvent.mockClear();
    trackEvent.mockClear();
  });

  it("fires book_download once for a primary download and preserves primary-action GA", () => {
    render(
      <BookOverviewActions
        bookId="book-how-serious-systems-learn"
        bookSlug="how-serious-systems-learn"
        actions={{
          primary: {
            kind: "download",
            href: "https://cdn.example.com/how-serious-systems-learn.pdf",
            label: "PDF",
          },
          secondary: [],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: /PDF/i }));
    expect(trackReaderEvent).toHaveBeenCalledTimes(1);
    expect(trackReaderEvent).toHaveBeenCalledWith({
      name: "book_download",
      properties: {
        book_id: "book-how-serious-systems-learn",
        format: "pdf",
        file_name: "PDF",
        link_url: "https://cdn.example.com/how-serious-systems-learn.pdf",
        location: "book_overview",
      },
    });
    expect(trackEvent).toHaveBeenCalledWith("book_overview_primary_action", {
      book_id: "book-how-serious-systems-learn",
      action_kind: "download",
    });
  });

  it("fires book_download once for a secondary epub download", () => {
    render(
      <BookOverviewActions
        bookId="book-1"
        bookSlug="demo"
        actions={{
          primary: {
            kind: "read",
            href: "/explore/books/demo/chapters/intro",
            label: "Read",
          },
          secondary: [
            {
              kind: "download",
              href: "https://cdn.example.com/demo.epub",
              label: "EPUB",
            },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: /EPUB/i }));
    expect(trackReaderEvent).toHaveBeenCalledTimes(1);
    expect(trackReaderEvent).toHaveBeenCalledWith({
      name: "book_download",
      properties: {
        book_id: "book-1",
        format: "epub",
        file_name: "EPUB",
        link_url: "https://cdn.example.com/demo.epub",
        location: "book_overview",
      },
    });
  });

  it("trackBookOverviewDownload normalizes format without firing twice when wrapped", () => {
    trackBookOverviewDownload("book-1", {
      href: "https://cdn.example.com/a.DOCX",
      label: "DOCX",
    });
    expect(trackReaderEvent).toHaveBeenCalledWith({
      name: "book_download",
      properties: {
        book_id: "book-1",
        format: "docx",
        file_name: "DOCX",
        link_url: "https://cdn.example.com/a.DOCX",
        location: "book_overview",
      },
    });
  });
});

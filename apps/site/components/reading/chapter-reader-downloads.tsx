"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { getSemanticBookActionLinkItems } from "@/lib/books/semantic-book-action-links";
import type { Book } from "@/types/semanticGraph";

function fileExtensionFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const ext = path.split(".").pop();
    return ext && ext.length <= 5 ? ext.toLowerCase() : "file";
  } catch {
    return "file";
  }
}

type ChapterReaderDownloadsProps = {
  book: Book;
};

/**
 * Minimal download affordances in reader chrome (ANALYTICS-001).
 * Fires file_download with location=reader — IDs and URL metadata only.
 */
export function ChapterReaderDownloads({ book }: ChapterReaderDownloadsProps) {
  const downloads = getSemanticBookActionLinkItems(book).filter((item) => item.kind === "download");
  if (downloads.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3" aria-label="Download this book">
      {downloads.map((item) => (
        <TrackedLink
          key={`${item.href}-${item.label}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-sm border border-border/80 px-6 py-3 text-sm uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          analytics={{
            event: AnalyticsEvents.fileDownload,
            params: {
              file_extension: fileExtensionFromUrl(item.href),
              file_name: item.label,
              link_url: item.href,
              content_type: "book",
              item_id: book.id,
              location: "reader",
            },
          }}
        >
          {item.label}
        </TrackedLink>
      ))}
    </div>
  );
}

import type { Metadata } from "next";

import type { Book } from "@/types/semanticGraph";

/** House open-graph.png size from tools/generate_open_graph.py. */
export const BOOK_OPEN_GRAPH_WIDTH = 1200;
export const BOOK_OPEN_GRAPH_HEIGHT = 630;

/**
 * Open Graph / Twitter image fields for book-scoped pages under
 * `/explore/books/[slug]` (detail, chapters, future nested routes).
 *
 * Returns `undefined` when the book has no `openGraphImage` so callers keep
 * the site default `/og.png` via `createPageMetadata`.
 */
export function bookOpenGraphImageFields(
  book: Pick<Book, "title" | "openGraphImage">,
): Pick<Metadata, "openGraph" | "twitter"> | undefined {
  if (!book.openGraphImage) return undefined;
  return {
    openGraph: {
      images: [
        {
          url: book.openGraphImage,
          width: BOOK_OPEN_GRAPH_WIDTH,
          height: BOOK_OPEN_GRAPH_HEIGHT,
          alt: book.title,
        },
      ],
    },
    twitter: {
      images: [book.openGraphImage],
    },
  };
}

import Link from "next/link";

import type { RelatedChapterLink } from "@/lib/graph/chapter-associations";

const DEFAULT_LIMIT = 8;

type RelatedChaptersSectionProps = {
  heading?: string;
  chapters: RelatedChapterLink[];
  /** Cap listed rows; remaining count is announced when truncated. */
  limit?: number;
};

/**
 * Thin chapter deep-link list for concept/pattern detail pages (READ-006).
 * Renders nothing when there are no associations.
 */
export function RelatedChaptersSection({
  heading = "Appears in chapters",
  chapters,
  limit = DEFAULT_LIMIT,
}: RelatedChaptersSectionProps) {
  if (chapters.length === 0) return null;

  const visible = chapters.slice(0, limit);
  const remaining = chapters.length - visible.length;

  return (
    <section aria-label={heading} className="space-y-4">
      <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
        {heading}
      </h2>
      <ol className="space-y-3 border-t border-border/30">
        {visible.map((chapter) => (
          <li key={chapter.id} className="border-b border-border/20 py-3">
            <Link
              href={chapter.href}
              className="font-medium text-fg transition-colors hover:text-accent"
            >
              {chapter.title}
            </Link>
            <p className="mt-1 text-sm text-muted">
              in{" "}
              <Link
                href={`/explore/books/${chapter.bookSlug}`}
                className="transition-colors hover:text-accent"
              >
                {chapter.bookTitle}
              </Link>
            </p>
          </li>
        ))}
      </ol>
      {remaining > 0 ? (
        <p className="text-sm text-muted">
          And {remaining} more chapter{remaining === 1 ? "" : "s"} with this association.
        </p>
      ) : null}
    </section>
  );
}

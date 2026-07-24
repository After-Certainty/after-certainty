import Link from "next/link";

import type { ChapterReadingNavigation } from "@/lib/reading/chapter-navigation";

export type ChapterTocProps = {
  navigation: ChapterReadingNavigation;
};

/**
 * In-reader table of contents with live chapter links (READ-004).
 * Uses native details/summary for accessible progressive disclosure.
 */
export function ChapterToc({ navigation }: ChapterTocProps) {
  const { parts, current, chapters } = navigation;
  if (chapters.length <= 1) return null;

  const longBook = chapters.length > 24 || parts.length > 4;

  return (
    <nav aria-label="Table of contents" className="mb-10">
      <details className="group border border-border/40 bg-bg-elevated/20 open:pb-2">
        <summary className="cursor-pointer list-none px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-muted marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            <span>In this book</span>
            <span className="text-fg/70 normal-case tracking-normal">
              {chapters.length} sections
              <span aria-hidden className="ml-2 text-muted group-open:hidden">
                +
              </span>
              <span aria-hidden className="ml-2 hidden text-muted group-open:inline">
                −
              </span>
            </span>
          </span>
        </summary>

        <div className="space-y-4 border-t border-border/30 px-4 py-4">
          {parts.map((part, partIndex) => {
            const heading =
              part.title?.trim() ||
              (parts.length === 1 ? "Chapters" : `Part ${part.position}`);
            const containsCurrent = part.chapters.some((chapter) => chapter.id === current.id);
            const defaultOpen = containsCurrent || partIndex === 0 || !longBook;

            return (
              <details
                key={part.id}
                className="group/part border-t border-border/20 pt-3 first:border-t-0 first:pt-0"
                open={defaultOpen}
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-fg marker:content-none [&::-webkit-details-marker]:hidden">
                  {heading}
                </summary>
                <ol className="mt-3 space-y-2 border-l border-border/30 pl-4">
                  {part.chapters.map((chapter) => {
                    const isCurrent = chapter.id === current.id;
                    return (
                      <li key={chapter.id}>
                        {isCurrent ? (
                          <span
                            aria-current="page"
                            className="block text-sm leading-snug text-accent"
                          >
                            {chapter.title}
                          </span>
                        ) : (
                          <Link
                            href={chapter.href}
                            className="block text-sm leading-snug text-muted transition-colors hover:text-accent"
                          >
                            {chapter.title}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </details>
            );
          })}
        </div>
      </details>
    </nav>
  );
}

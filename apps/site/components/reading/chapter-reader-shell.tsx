import type { ReactNode } from "react";
import Link from "next/link";

import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ChapterAdjacentNav } from "@/components/reading/chapter-adjacent-nav";
import { ChapterToc } from "@/components/reading/chapter-toc";
import { ButtonLink } from "@/components/ui/button-link";
import { chapterKindLabel } from "@/lib/books/book-chapter-view-model";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { ChapterReadingNavigation } from "@/lib/reading/chapter-navigation";
import type { Book, ManifestChapter } from "@/types/semanticGraph";

export type ChapterReaderShellProps = {
  book: Book;
  chapter: ManifestChapter;
  /** Prev/next + TOC from READ-004; omit for single-chapter edge cases. */
  navigation?: ChapterReadingNavigation | null;
  /** Manuscript body — empty until READ-003. */
  children?: ReactNode;
};

/**
 * SSR chapter reading chrome (READ-002 + READ-004 + READ-008 a11y).
 * Overview TOC links stay off until READ-006.
 */
export function ChapterReaderShell({
  book,
  chapter,
  navigation,
  children,
}: ChapterReaderShellProps) {
  const kindLabel = chapterKindLabel(chapter.kind);
  const bookHref = `${explorePaths.books}/${book.slug}`;
  const minutes =
    typeof chapter.estimatedReadingMinutes === "number" && chapter.estimatedReadingMinutes > 0
      ? chapter.estimatedReadingMinutes
      : undefined;
  const summary = chapter.summary?.trim();
  const centralQuestion = chapter.centralQuestion?.trim();

  const breadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Books", href: explorePaths.books },
    { label: book.title, href: bookHref },
    { label: chapter.title },
  ];

  return (
    <article
      aria-labelledby="chapter-title"
      className="relative mx-auto max-w-3xl px-4 py-12 md:py-16"
    >
      <a href="#chapter-content" className="reader-skip-link">
        Skip to chapter text
      </a>

      <BreadcrumbTrail items={breadcrumbs} />

      <header className="mb-8 space-y-4 border-b border-border/40 pb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href={bookHref} className="transition-colors hover:text-accent">
            {book.title}
          </Link>
          {chapter.partTitle ? (
            <>
              <span className="mx-2 text-border" aria-hidden>
                /
              </span>
              <span>{chapter.partTitle}</span>
            </>
          ) : null}
        </p>

        <h1
          id="chapter-title"
          className="font-display text-3xl leading-tight text-fg md:text-4xl"
        >
          {chapter.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {kindLabel ? <span>{kindLabel}</span> : null}
          {kindLabel && minutes ? <span aria-hidden>·</span> : null}
          {minutes ? (
            <span>
              About {minutes} min
              {minutes === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {centralQuestion ? (
          <p className="text-base leading-relaxed text-fg/90 md:text-lg">
            <span className="sr-only">Central question: </span>
            {centralQuestion}
          </p>
        ) : null}

        {summary ? <p className="text-sm leading-relaxed text-muted md:text-base">{summary}</p> : null}
      </header>

      {navigation ? <ChapterToc navigation={navigation} /> : null}

      <div
        id="chapter-content"
        tabIndex={-1}
        className="chapter-body prose-reading min-h-[12rem] scroll-mt-24 outline-none"
      >
        {children ?? (
          <div
            role="status"
            className="rounded-sm border border-border/50 bg-bg-elevated/40 px-5 py-8 text-sm leading-relaxed text-muted"
          >
            <p className="mb-3 text-fg/80">Full chapter text is not on this page yet.</p>
            <p>
              Orientation metadata is live so chapter URLs are stable. Manuscript rendering arrives
              in a follow-on pass. Downloads remain available from the{" "}
              <Link href={bookHref} className="text-accent underline-offset-2 hover:underline">
                book page
              </Link>
              .
            </p>
          </div>
        )}
      </div>

      <footer className="mt-12 space-y-8 border-t border-border/40 pt-8">
        {navigation ? (
          <ChapterAdjacentNav prev={navigation.prev} next={navigation.next} />
        ) : null}
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={bookHref} variant="ghost">
            Back to book
          </ButtonLink>
        </div>
      </footer>
    </article>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";

import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ChapterAdjacentNav } from "@/components/reading/chapter-adjacent-nav";
import { ChapterReaderDownloads } from "@/components/reading/chapter-reader-downloads";
import { ChapterToc } from "@/components/reading/chapter-toc";
import {
  CopySectionLinkControl,
  ManuscriptHeadingCopyLinks,
} from "@/components/reading/copy-section-link";
import { InBookSearch } from "@/components/reading/in-book-search";
import { ChapterBookmarkControl } from "@/components/reading/reading-bookmarks-panel";
import { ReadingProgressChrome } from "@/components/reading/reading-progress-chrome";
import {
  ReadingPreferencesControls,
  ReadingPreferencesRoot,
} from "@/components/reading/reading-preferences-controls";
import { RecordChapterOpen } from "@/components/reading/record-chapter-open";
import { RecordReadingProgress } from "@/components/reading/record-reading-progress";
import { RestoreReadingScroll } from "@/components/reading/restore-reading-scroll";
import { ButtonLink } from "@/components/ui/button-link";
import { chapterKindLabel } from "@/lib/books/book-chapter-view-model";
import { chapterPublicPath, chapterSlugFromRouteKey } from "@/lib/graph/chapters";
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
 * SSR chapter reading chrome (READ-002 + READ-004 + READ-008 a11y + READ-011–016).
 * Phase E: sticky progress chrome, denser mobile header, focused exit affordance.
 */
export function ChapterReaderShell({
  book,
  chapter,
  navigation,
  children,
}: ChapterReaderShellProps) {
  const kindLabel = chapterKindLabel(chapter.kind);
  const bookHref = `${explorePaths.books}/${book.slug}`;
  const chapterPath =
    chapterPublicPath(chapter) ??
    `${bookHref}/chapters/${chapterSlugFromRouteKey(chapter.routeKey)}`;
  const minutes =
    typeof chapter.estimatedReadingMinutes === "number" && chapter.estimatedReadingMinutes > 0
      ? chapter.estimatedReadingMinutes
      : undefined;
  const summary = chapter.summary?.trim();
  const centralQuestion = chapter.centralQuestion?.trim();
  const progressEditionId = chapter.editionId || book.id;
  const chapterIndex = navigation
    ? navigation.chapters.findIndex((entry) => entry.id === navigation.current.id) + 1
    : undefined;
  const chapterCount = navigation?.chapters.length;

  const breadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Books", href: explorePaths.books },
    { label: book.title, href: bookHref },
    { label: chapter.title },
  ];

  return (
    <ReadingPreferencesRoot
      aria-labelledby="chapter-title"
      data-chapter-reader=""
      className="relative mx-auto px-4 py-6 md:py-12"
    >
      <RecordReadingProgress editionId={progressEditionId} chapterId={chapter.id} />
      <RestoreReadingScroll editionId={progressEditionId} chapterId={chapter.id} />
      <RecordChapterOpen bookId={book.id} chapterId={chapter.id} editionId={progressEditionId} />
      <ManuscriptHeadingCopyLinks />

      <a href="#chapter-content" className="reader-skip-link">
        Skip to chapter text
      </a>

      <ReadingProgressChrome
        bookTitle={book.title}
        bookHref={bookHref}
        chapterIndex={chapterIndex && chapterIndex > 0 ? chapterIndex : undefined}
        chapterCount={chapterCount}
      />

      <div className="hidden md:block">
        <BreadcrumbTrail items={breadcrumbs} />
      </div>

      <header className="mb-6 space-y-3 border-b border-border/40 pb-6 md:mb-8 md:space-y-4 md:pb-8">
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
          className="font-display text-2xl leading-tight text-fg sm:text-3xl md:text-4xl"
        >
          {chapter.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
          {kindLabel ? <span>{kindLabel}</span> : null}
          {kindLabel && minutes ? <span aria-hidden>·</span> : null}
          {minutes ? (
            <span>
              About {minutes} min
              {minutes === 1 ? "" : "s"}
            </span>
          ) : null}
          <ChapterBookmarkControl
            editionId={progressEditionId}
            chapterId={chapter.id}
            chapterTitle={chapter.title}
          />
          <CopySectionLinkControl chapterPath={chapterPath} />
        </div>

        <ReadingPreferencesControls />

        {centralQuestion ? (
          <p className="text-base leading-relaxed text-fg/90 md:text-lg">
            <span className="sr-only">Central question: </span>
            {centralQuestion}
          </p>
        ) : null}

        {summary ? (
          <p className="text-sm leading-relaxed text-muted md:text-base">{summary}</p>
        ) : null}

        {navigation ? (
          <ChapterAdjacentNav
            prev={navigation.prev}
            next={navigation.next}
            bookId={book.id}
            fromChapterId={chapter.id}
            ariaLabel="Previous and next chapter"
            className="flex flex-row items-start justify-between gap-4 border-t border-border/30 pt-6 sm:gap-10"
          />
        ) : null}
      </header>

      {navigation ? <ChapterToc navigation={navigation} /> : null}
      <InBookSearch editionId={progressEditionId} bookTitle={book.title} variant="reader" />

      <div
        id="chapter-content"
        tabIndex={-1}
        className="chapter-body prose-reading min-h-[12rem] scroll-mt-28 outline-none md:scroll-mt-24"
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
          <ChapterAdjacentNav
            prev={navigation.prev}
            next={navigation.next}
            bookId={book.id}
            fromChapterId={chapter.id}
            ariaLabel="Previous and next chapter at end of page"
          />
        ) : null}
        <ChapterReaderDownloads book={book} />
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={bookHref} variant="ghost">
            Back to book
          </ButtonLink>
        </div>
      </footer>
    </ReadingPreferencesRoot>
  );
}

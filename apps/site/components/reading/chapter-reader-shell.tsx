import type { ReactNode } from "react";
import Link from "next/link";

import { ChapterAdjacentNav } from "@/components/reading/chapter-adjacent-nav";
import {
  CopySectionLinkControl,
  ManuscriptHeadingCopyLinks,
} from "@/components/reading/copy-section-link";
import { ReaderChrome } from "@/components/reading/reader-chrome";
import { ReadingPreferencesRoot } from "@/components/reading/reading-preferences-controls";
import { RecordChapterOpen } from "@/components/reading/record-chapter-open";
import { RecordReadingProgress } from "@/components/reading/record-reading-progress";
import { ResetSpokenContent } from "@/components/reading/reset-spoken-content";
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
 * Dedicated chapter reading shell — compact toolbar, Radix controls drawer,
 * focused reading surface (no site header/footer; those are gated by SiteShell).
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
  const summary = chapter.summary?.trim();
  const centralQuestion = chapter.centralQuestion?.trim();
  const progressEditionId = chapter.editionId || book.id;
  const chapterIndex = navigation
    ? navigation.chapters.findIndex((entry) => entry.id === navigation.current.id) + 1
    : undefined;
  const chapterCount = navigation?.chapters.length;

  return (
    <ReadingPreferencesRoot
      key={chapter.id}
      aria-labelledby="chapter-title"
      data-chapter-reader=""
      className="relative mx-auto px-4 pb-10 pt-0 md:pb-16"
    >
      <ResetSpokenContent chapterId={chapter.id} chapterTitle={chapter.title} />
      <RecordReadingProgress editionId={progressEditionId} chapterId={chapter.id} />
      <RestoreReadingScroll editionId={progressEditionId} chapterId={chapter.id} />
      <RecordChapterOpen bookId={book.id} chapterId={chapter.id} editionId={progressEditionId} />
      <ManuscriptHeadingCopyLinks />

      <a href="#chapter-content" className="reader-skip-link">
        Skip to chapter text
      </a>

      <ReaderChrome
        bookTitle={book.title}
        bookHref={bookHref}
        chapterTitle={chapter.title}
        editionId={progressEditionId}
        chapterId={chapter.id}
        chapterIndex={chapterIndex && chapterIndex > 0 ? chapterIndex : undefined}
        chapterCount={chapterCount}
        navigation={navigation}
      />

      <header className="mb-6 space-y-3 pt-6 md:mb-8 md:pt-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-accent">
          {kindLabel || (chapter.partTitle ? chapter.partTitle : "Chapter")}
        </p>

        <h1
          id="chapter-title"
          className="font-display text-3xl leading-tight text-fg sm:text-4xl md:text-[2.75rem]"
        >
          {chapter.title}
        </h1>

        <div className="flex justify-center py-1" aria-hidden>
          <span className="text-accent/80">❧</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
          <CopySectionLinkControl chapterPath={chapterPath} />
        </div>

        {centralQuestion ? (
          <p className="text-base leading-relaxed text-fg/90 md:text-lg">
            <span className="sr-only">Central question: </span>
            {centralQuestion}
          </p>
        ) : null}

        {summary ? (
          <p className="text-sm leading-relaxed text-muted md:text-base">{summary}</p>
        ) : null}
      </header>

      <div
        id="chapter-content"
        tabIndex={-1}
        className="chapter-body prose-reading min-h-[12rem] scroll-mt-24 outline-none md:scroll-mt-28"
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

      <footer className="mt-12 space-y-8 border-t border-border/30 pt-8">
        {navigation ? (
          <ChapterAdjacentNav
            prev={navigation.prev}
            next={navigation.next}
            bookId={book.id}
            fromChapterId={chapter.id}
            ariaLabel="Previous and next chapter"
            className="flex flex-row items-start justify-between gap-4 sm:gap-10"
          />
        ) : null}
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={bookHref} variant="ghost">
            Back to book
          </ButtonLink>
        </div>
      </footer>
    </ReadingPreferencesRoot>
  );
}

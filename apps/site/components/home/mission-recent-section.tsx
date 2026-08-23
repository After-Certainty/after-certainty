import Link from "next/link";

import { BookCoverThumbnail } from "@/components/books/book-cover-thumbnail";
import { WhatsNewHomePreview } from "@/components/whats-new/whats-new-home-preview";
import { Container } from "@/components/ui/container";
import { getBookDetailHref } from "@/lib/books/book-routing";
import { getFeaturedBook } from "@/lib/books/featured-book";
import { resolveBookCoverSrc } from "@/lib/books/resolve-book-cover";

/**
 * Lower homepage block: editorial What’s New + Featured Book.
 * Mission copy lives in `WhyProjectExistsSection` later on the page.
 */
export async function MissionRecentSection() {
  const book = await getFeaturedBook();

  return (
    <section className="border-b border-border/40 bg-bg py-6 md:py-12 lg:py-14">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-0 lg:border lg:border-border/45 lg:bg-bg-elevated/25 light:lg:bg-bg-elevated">
          <div className="min-w-0 lg:col-span-7 lg:border-r lg:border-border/40 lg:p-8 xl:p-10">
            <WhatsNewHomePreview />
          </div>

          <div className="min-w-0 lg:col-span-5 lg:p-8 xl:p-10">
            {book ? (
              <div
                className="flex gap-4 border border-border/50 bg-bg-elevated/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] md:gap-5 md:p-5 lg:h-full lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none light:bg-bg-elevated light:shadow-none light:lg:bg-transparent"
                data-featured-book
              >
                <BookCoverThumbnail src={resolveBookCoverSrc(book, "thumbnail")} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-accent">Featured book</p>
                  <h3 className="mt-2 font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
                    {book.title}
                  </h3>
                  {book.subtitle ? (
                    <p className="mt-1 text-sm text-muted">{book.subtitle}</p>
                  ) : null}
                  <Link
                    href={getBookDetailHref(book.slug)}
                    className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:mt-auto md:pt-5"
                  >
                    Learn more →
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

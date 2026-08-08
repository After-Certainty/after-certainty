import Link from "next/link";

import { BookCoverThumbnail } from "@/components/books/book-cover-thumbnail";
import { WhatsNewHomePreview } from "@/components/whats-new/whats-new-home-preview";
import { Container } from "@/components/ui/container";
import { getBookDetailHref, getFeaturedBook } from "@/lib/content-data";
import { resolveBookCoverSrc } from "@/lib/books/resolve-book-cover";

/**
 * Lower homepage block: editorial What’s New + Featured Book.
 * Mission copy lives in `WhyProjectExistsSection` earlier on the page.
 */
export async function MissionRecentSection() {
  const book = await getFeaturedBook();

  return (
    <section className="border-b border-border/40 bg-bg py-6 md:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-0">
          <div className="lg:border-r lg:border-border/35 lg:pr-12 xl:pr-16">
            <WhatsNewHomePreview />
          </div>

          <div className="lg:pl-12 xl:pl-16">
            {book ? (
              <div className="flex gap-4 md:gap-5">
                <BookCoverThumbnail src={resolveBookCoverSrc(book, "thumbnail")} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-accent">
                    Featured book
                  </p>
                  <h3 className="mt-2 font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
                    {book.title}
                  </h3>
                  {book.subtitle ? (
                    <p className="mt-1 text-sm text-muted">{book.subtitle}</p>
                  ) : null}
                  <Link
                    href={getBookDetailHref(book.slug)}
                    className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:mt-5"
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

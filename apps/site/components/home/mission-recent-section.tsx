import Link from "next/link";

import { BookCoverThumbnail } from "@/components/books/book-cover-thumbnail";
import { WhatsNewHomePreview } from "@/components/whats-new/whats-new-home-preview";
import { Container } from "@/components/ui/container";
import { getBookDetailHref, getFeaturedBook } from "@/lib/content-data";

export async function MissionRecentSection() {
  const book = await getFeaturedBook();

  return (
    <section className="border-b border-border/40 bg-bg py-20 md:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-0">
          <div className="lg:border-r lg:border-border/35 lg:pr-12 xl:pr-16">
            <p className="text-xs uppercase tracking-[0.28em] text-accent">
              Why this project exists
            </p>
            <blockquote className="mt-6 font-display text-2xl leading-snug text-fg md:text-3xl md:leading-tight">
              We live in a time when certainty is everywhere, and understanding is scarce.
            </blockquote>
            <div className="mt-8 h-px w-12 bg-accent/55" aria-hidden />
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted md:text-base">
              <p>
                After Certainty is an intellectual commons: a place to read, listen, and think
                together when easy answers fail—without pretending the hard questions disappear.
              </p>
              <p>
                Books, patterns, and conversations here are offered under open terms so ideas can
                travel, fork, and improve in public.
              </p>
            </div>
            <Link
              href="/about"
              className="mt-10 inline-block text-xs uppercase tracking-[0.22em] text-accent transition-colors hover:text-fg"
            >
              Learn more about the project →
            </Link>
          </div>

          <div className="lg:pl-12 xl:pl-16">
            <WhatsNewHomePreview />

            {book ? (
              <>
                <hr className="my-10 border-border/40" />
                <div className="flex gap-5">
                  <BookCoverThumbnail src={book.coverImage} />
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
                      className="mt-5 inline-block text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg"
                    >
                      Learn more →
                    </Link>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

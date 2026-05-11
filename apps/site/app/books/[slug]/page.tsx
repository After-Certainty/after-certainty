import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { BookCatalogDownloadLinks } from "@/components/books/book-catalog-download-links";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getBookDownloadLinkItems } from "@/lib/books/book-download-links";
import {
  shouldRedirectSlugToWoltyMicrosite,
  slugExcludedFromBookDetailStaticParams,
  WOLTY_MICROSITE_PATH,
} from "@/lib/books/generated-manifest";
import { getBookBySlug, getBooks } from "@/lib/content-data";
import { createPageMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  const books = await getBooks();
  return books
    .filter((book) => !slugExcludedFromBookDetailStaticParams(book.slug))
    .map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (shouldRedirectSlugToWoltyMicrosite(slug)) {
    permanentRedirect(WOLTY_MICROSITE_PATH);
  }
  const book = await getBookBySlug(slug);
  if (!book) {
    return {};
  }
  return createPageMetadata({
    title: book.title,
    description: book.description,
  });
}

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (shouldRedirectSlugToWoltyMicrosite(slug)) {
    permanentRedirect(WOLTY_MICROSITE_PATH);
  }
  const book = await getBookBySlug(slug);
  if (!book) {
    notFound();
  }

  const downloadLinks = getBookDownloadLinkItems(book);

  return (
    <Section className="pt-12">
      <Container className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{book.status}</p>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-fg md:text-5xl">
          {book.title}
        </h1>
        {book.subtitle ? <p className="mt-4 text-xl text-muted">{book.subtitle}</p> : null}
        <p className="mt-8 text-lg leading-relaxed text-muted">{book.description}</p>
        <BookCatalogDownloadLinks links={downloadLinks} />
        <dl className="mt-12 space-y-4 border-y border-border/60 py-8 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
            <dt className="uppercase tracking-[0.2em] text-muted">Authors</dt>
            <dd className="text-fg">{book.authors.join(", ")}</dd>
          </div>
          {book.year ? (
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
              <dt className="uppercase tracking-[0.2em] text-muted">Year</dt>
              <dd className="text-fg">{book.year}</dd>
            </div>
          ) : null}
          {book.githubUrl || book.repositoryUrl ? (
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
              <dt className="uppercase tracking-[0.2em] text-muted">Repository</dt>
              <dd>
                <Link
                  className="text-accent underline-offset-4 hover:underline"
                  href={book.githubUrl ?? book.repositoryUrl!}
                >
                  Source
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-10 text-sm text-muted">
          <Link className="text-accent" href="/books">
            ← All books
          </Link>
        </p>
      </Container>
    </Section>
  );
}

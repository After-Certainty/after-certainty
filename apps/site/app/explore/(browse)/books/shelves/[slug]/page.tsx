import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogBookCard } from "@/components/books/catalog-book-card";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { Section } from "@/components/ui/section";
import { catalogBrowseQueryString } from "@/lib/books/catalog-url-state";
import { buildCatalogViewModel } from "@/lib/books/catalog-view-model";
import { getActiveShelves, getShelfBySlug, resolveShelfBooks } from "@/lib/books/shelves";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { exploreBooksShelfHref, explorePaths } from "@/lib/graph/explorePaths";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const shelf = getShelfBySlug(graph, slug);
  if (!shelf) return {};
  return createPageMetadata({
    title: `${shelf.title} · Books`,
    description: shelf.description,
    alternates: { canonical: exploreBooksShelfHref(shelf.slug) },
  });
}

export default async function ExploreBooksShelfPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const shelf = getShelfBySlug(graph, slug);
  if (!shelf) notFound();

  const viewModel = buildCatalogViewModel(graph);
  const books = resolveShelfBooks(shelf, viewModel);
  const bookCountLabel = `${books.length} ${books.length === 1 ? "book" : "books"}`;

  const relatedShelves = getActiveShelves(graph)
    .filter((s) => s.slug !== shelf.slug)
    .map((s) => ({
      shelf: s,
      count: resolveShelfBooks(s, viewModel).length,
    }))
    .filter(({ count }) => count > 0)
    .slice(0, 8);

  const catalogFilterHref = `${explorePaths.books}${catalogBrowseQueryString({
    shelf: shelf.slug,
    types: [],
    statuses: [],
    availability: [],
    sort: "recommended",
    q: "",
    editions: "default",
  })}`;

  const breadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Books", href: explorePaths.books },
    { label: shelf.title },
  ];

  return (
    <article>
      <Section atmosphere="none" className="!pb-8 pt-8 md:!pb-12 md:pt-12">
        <BreadcrumbTrail items={breadcrumbs} />

        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Curated shelf</p>
        <h1
          id="shelf-heading"
          className="mt-3 font-display text-3xl font-medium tracking-tight text-fg md:text-5xl"
        >
          {shelf.title}
        </h1>
        <p className="mt-2 text-sm text-muted md:text-base">{bookCountLabel}</p>
        {shelf.description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {shelf.description}
          </p>
        ) : null}
      </Section>

      <Section
        atmosphere="none"
        className="!py-6 border-t border-border/25 md:!py-10"
        aria-labelledby="shelf-books-heading"
      >
        <h2 id="shelf-books-heading" className="sr-only">
          Books on this shelf
        </h2>

        {books.length === 0 ? (
          <div className="rounded-sm border border-border/40 bg-bg-elevated/30 p-6 text-sm text-muted">
            <p>No public books are on this shelf yet.</p>
            <p className="mt-3">
              <Link
                href={explorePaths.books}
                className="text-accent underline-offset-4 hover:underline"
              >
                Back to Books
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div
              className="flex flex-col gap-[var(--books-row-gap)] md:hidden"
              data-books-layout="list"
            >
              {books.map((book) => (
                <CatalogBookCard key={book.id} book={book} location="shelf" layout="list" />
              ))}
            </div>
            <div className="hidden min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid md:grid-cols-2 md:gap-5 xl:grid-cols-3">
              {books.map((book) => (
                <CatalogBookCard key={book.id} book={book} location="shelf" />
              ))}
            </div>
          </>
        )}

        <p className="mt-6 text-sm text-muted md:mt-10">
          <Link
            href={explorePaths.books}
            className="text-accent underline-offset-4 hover:underline"
          >
            ← All shelves
          </Link>
          <span className="mx-2 text-border" aria-hidden>
            ·
          </span>
          <Link href={catalogFilterHref} className="text-accent underline-offset-4 hover:underline">
            Filter catalog by this shelf
          </Link>
        </p>
      </Section>

      {relatedShelves.length > 0 ? (
        <Section
          atmosphere="transition"
          className="!py-8 border-t border-border/25 md:!py-14"
          aria-labelledby="related-shelves-heading"
        >
          <h2
            id="related-shelves-heading"
            className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl"
          >
            Other shelves
          </h2>
          <ul className="mt-4 space-y-1 md:mt-6">
            {relatedShelves.map(({ shelf: related, count }) => (
              <li key={related.id}>
                <Link
                  href={exploreBooksShelfHref(related.slug)}
                  className="flex min-h-11 items-baseline justify-between gap-3 border-b border-border/30 py-2.5 text-fg transition-colors hover:text-accent"
                >
                  <span className="font-display text-base">{related.title}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {count} {count === 1 ? "book" : "books"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </article>
  );
}

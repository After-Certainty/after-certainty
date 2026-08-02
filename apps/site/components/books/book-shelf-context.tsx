import Link from "next/link";

import { CatalogBookCard } from "@/components/books/catalog-book-card";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import type { ShelfAdjacentBooks, ShelfDefinition } from "@/lib/books/shelves";
import { exploreBooksShelfHref, explorePaths } from "@/lib/graph/explorePaths";

export type BookShelfContextProps = {
  membershipShelves: ShelfDefinition[];
  /** Primary shelf adjacency for also-in-shelf + prev/next. */
  primaryShelf?: ShelfAdjacentBooks | null;
  /** Current book id — excluded from also-in-shelf list. */
  currentBookId: string;
};

/**
 * Shelf membership chips, also-in-shelf neighbors, and shelf-order prev/next.
 * Omits itself when the book is on no public shelves.
 */
export function BookShelfContext({
  membershipShelves,
  primaryShelf,
  currentBookId,
}: BookShelfContextProps) {
  if (membershipShelves.length === 0 && !primaryShelf) return null;

  const alsoInShelf = (primaryShelf?.books ?? [])
    .filter((book) => book.id !== currentBookId)
    .slice(0, 6);

  const prev = primaryShelf?.previous
    ? { slug: primaryShelf.previous.slug, title: primaryShelf.previous.title }
    : undefined;
  const next = primaryShelf?.next
    ? { slug: primaryShelf.next.slug, title: primaryShelf.next.title }
    : undefined;

  return (
    <section className="mt-8 space-y-6 border-t border-border/25 pt-8" aria-label="Shelf context">
      {membershipShelves.length > 0 ? (
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.28em] text-accent">On these shelves</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {membershipShelves.map((shelf) => (
              <li key={shelf.id}>
                <Link
                  href={exploreBooksShelfHref(shelf.slug)}
                  className="inline-flex min-h-11 items-center rounded-sm border border-border/50 px-3 py-2 text-sm text-fg transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {shelf.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {primaryShelf && alsoInShelf.length > 0 ? (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[11px] uppercase tracking-[0.28em] text-accent">
              Also in {primaryShelf.shelf.title}
            </h2>
            <Link
              href={exploreBooksShelfHref(primaryShelf.shelf.slug)}
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              View all {primaryShelf.books.length} →
            </Link>
          </div>
          <div
            className="mt-3 flex flex-col gap-[var(--books-row-gap)] md:hidden"
            data-books-layout="list"
          >
            {alsoInShelf.map((book) => (
              <AlsoInShelfCard key={book.id} book={book} />
            ))}
          </div>
          <div className="mt-4 hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
            {alsoInShelf.map((book) => (
              <CatalogBookCard key={book.id} book={book} location="shelf" layout="detailed" />
            ))}
          </div>
        </div>
      ) : null}

      {prev || next ? (
        <ExploreAdjacentNav
          basePath={explorePaths.books}
          entityLabel="book"
          orderDescription={`in ${primaryShelf?.shelf.title ?? "shelf"} order`}
          className="border-t border-border/25 pt-6"
          prev={prev}
          next={next}
        />
      ) : null}
    </section>
  );
}

function AlsoInShelfCard({ book }: { book: CatalogBookView }) {
  return <CatalogBookCard book={book} location="shelf" layout="list" />;
}

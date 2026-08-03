"use client";

import { useId, useState } from "react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { CatalogBookCard } from "@/components/books/catalog-book-card";
import { DisclosureChevron } from "@/components/ui/disclosure-chevron";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import type { ShelfDefinition } from "@/lib/books/shelves";
import { exploreBooksShelfHref } from "@/lib/graph/explorePaths";

type BooksShelfSectionProps = {
  shelf: ShelfDefinition;
  books: CatalogBookView[];
  totalCount: number;
  showViewAll?: boolean;
  /** When true, the mobile accordion starts expanded (Start Here). */
  defaultOpen?: boolean;
};

export function BooksShelfSection({
  shelf,
  books,
  totalCount,
  showViewAll = true,
  defaultOpen = false,
}: BooksShelfSectionProps) {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);

  if (books.length === 0) return null;

  const viewAllHref = exploreBooksShelfHref(shelf.slug);

  const bookCountLabel = `${totalCount} ${totalCount === 1 ? "book" : "books"}`;
  const mobileHeadingId = `shelf-${shelf.slug}-heading`;
  const desktopHeadingId = `shelf-${shelf.slug}-heading-desktop`;

  return (
    // Density tokens (--books-section-y-*) prepare Phase B hero/catalog tightening.
    <section
      className="border-b border-border/35 py-0 md:py-[var(--books-section-y-md)]"
      aria-label={shelf.title}
    >
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-3 py-[var(--books-row-py)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="min-w-0 flex-1 leading-tight">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h2
              id={mobileHeadingId}
              className="font-display text-base font-medium tracking-tight text-fg"
            >
              {shelf.title}
            </h2>
            <span className="text-[11px] leading-none text-muted">{bookCountLabel}</span>
          </span>
        </span>
        <DisclosureChevron expanded={open} />
      </button>

      <div className="hidden space-y-3 md:block">
        <h2
          id={desktopHeadingId}
          className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl"
        >
          {shelf.title}
        </h2>
        <p className="max-w-2xl text-muted">{shelf.description}</p>
      </div>

      <div
        id={panelId}
        className={open ? "block md:block" : "hidden md:block"}
        role="region"
        aria-label={shelf.title}
      >
        {shelf.description ? (
          <p className="pb-1 max-w-2xl text-sm leading-snug text-muted md:hidden">
            {shelf.description}
          </p>
        ) : null}

        {/* Mobile: dense list rows (Phase A). Desktop: existing card grid. */}
        <div
          className="mt-1 flex flex-col gap-[var(--books-row-gap)] md:hidden"
          data-books-layout="list"
        >
          {books.map((book) => (
            <CatalogBookCard key={book.id} book={book} location="shelf" layout="list" />
          ))}
        </div>

        <div className="mt-2 hidden min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:mt-10 md:grid md:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {books.map((book) => (
            <CatalogBookCard key={book.id} book={book} location="shelf" />
          ))}
        </div>

        {showViewAll ? (
          <p className="mt-2 mb-2 md:mt-8 md:mb-0">
            <TrackedLink
              href={viewAllHref}
              className="inline-flex min-h-11 items-center text-sm text-accent underline-offset-4 hover:underline"
              analytics={{
                event: "books_shelf_select",
                params: { shelf_id: shelf.id },
              }}
            >
              {totalCount > books.length ? `View all ${totalCount} books →` : `View shelf →`}
            </TrackedLink>
          </p>
        ) : null}
      </div>
    </section>
  );
}

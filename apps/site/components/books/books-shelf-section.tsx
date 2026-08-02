"use client";

import { useId, useState } from "react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { CatalogBookCard } from "@/components/books/catalog-book-card";
import { catalogBrowseQueryString } from "@/lib/books/catalog-url-state";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import type { ShelfDefinition } from "@/lib/books/shelves";

type BooksShelfSectionProps = {
  shelf: ShelfDefinition;
  books: CatalogBookView[];
  totalCount: number;
  showViewAll?: boolean;
  /** When true, the mobile accordion starts expanded (Start Here). */
  defaultOpen?: boolean;
};

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${
        expanded ? "rotate-180" : ""
      }`}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  // Phase C will switch this to exploreBooksShelfHref(shelf.slug).
  const viewAllHref = `/explore/books${catalogBrowseQueryString({
    shelf: shelf.slug,
    types: [],
    statuses: [],
    availability: [],
    sort: "recommended",
    q: "",
    editions: "default",
  })}`;

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
        <Chevron expanded={open} />
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

        {showViewAll && totalCount > books.length ? (
          <p className="mt-2 mb-2 md:mt-8 md:mb-0">
            <TrackedLink
              href={viewAllHref}
              className="inline-flex min-h-11 items-center text-sm text-accent underline-offset-4 hover:underline"
              analytics={{
                event: "books_shelf_select",
                params: { shelf_id: shelf.id },
              }}
            >
              View all {totalCount} books →
            </TrackedLink>
          </p>
        ) : null}
      </div>
    </section>
  );
}

"use client";

import { useId, useState } from "react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { CatalogBookCard } from "@/components/books/catalog-book-card";
import { Section } from "@/components/ui/section";
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
    <Section
      atmosphere="none"
      className="border-b border-border/35 py-4 md:py-20"
      aria-label={shelf.title}
    >
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="min-w-0 flex-1">
          <h2
            id={mobileHeadingId}
            className="font-display text-xl font-medium tracking-tight text-fg"
          >
            {shelf.title}
          </h2>
          <span className="mt-0.5 block text-xs text-muted">{bookCountLabel}</span>
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
          <p className="mt-2 max-w-2xl text-sm text-muted md:hidden">{shelf.description}</p>
        ) : null}

        <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:mt-10 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {books.map((book) => (
            <CatalogBookCard key={book.id} book={book} location="shelf" />
          ))}
        </div>

        {showViewAll && totalCount > books.length ? (
          <p className="mt-6 md:mt-8">
            <TrackedLink
              href={viewAllHref}
              className="text-sm text-accent underline-offset-4 hover:underline"
              analytics={{
                event: "books_shelf_select",
                params: { shelf_id: shelf.id },
              }}
            >
              View all {totalCount} books
            </TrackedLink>
          </p>
        ) : null}
      </div>
    </Section>
  );
}

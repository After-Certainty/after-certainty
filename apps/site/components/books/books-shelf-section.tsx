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
};

export function BooksShelfSection({
  shelf,
  books,
  totalCount,
  showViewAll = true,
}: BooksShelfSectionProps) {
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

  return (
    <Section
      atmosphere="none"
      className="border-b border-border/35 py-14 md:py-20"
      aria-labelledby={`shelf-${shelf.slug}-heading`}
    >
      <div className="space-y-3">
        <h2
          id={`shelf-${shelf.slug}-heading`}
          className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl"
        >
          {shelf.title}
        </h2>
        <p className="max-w-2xl text-muted">{shelf.description}</p>
      </div>
      <div className="mt-10 grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {books.map((book) => (
          <CatalogBookCard key={book.id} book={book} location="shelf" />
        ))}
      </div>
      {showViewAll && totalCount > books.length ? (
        <p className="mt-8">
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
    </Section>
  );
}

import { CatalogBookCard } from "@/components/books/catalog-book-card";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";

type BooksCatalogResultsProps = {
  results: CatalogBookView[];
  query?: string;
  hasActiveFilters: boolean;
};

export function BooksCatalogResults({
  results,
  query = "",
  hasActiveFilters,
}: BooksCatalogResultsProps) {
  const trimmedQuery = query.trim();
  const resultSummary =
    results.length === 0
      ? trimmedQuery
        ? `No books match "${trimmedQuery}".`
        : hasActiveFilters
          ? "No books match the current filters."
          : "No books are available in the catalog yet."
      : `${results.length} ${results.length === 1 ? "book" : "books"}`;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted" aria-live="polite" aria-atomic="true">
        {resultSummary}
      </p>
      {results.length === 0 ? (
        <div className="rounded-sm border border-border/40 bg-bg-elevated/30 p-6 text-sm text-muted">
          {trimmedQuery ? (
            <p>Try a shorter phrase or clear the search to browse shelves.</p>
          ) : hasActiveFilters ? (
            <p>Remove filters one at a time, or clear all filters to return to the full library.</p>
          ) : (
            <p>Check back when new volumes are linked in the semantic manifest.</p>
          )}
        </div>
      ) : (
        <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((book) => (
            <CatalogBookCard key={book.id} book={book} location="catalog" />
          ))}
        </div>
      )}
    </div>
  );
}

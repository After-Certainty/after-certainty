import { CompactBookRow } from "@/components/explore/compact-book-row";
import type { Book } from "@/types/semanticGraph";

type RelatedBooksSectionProps = {
  books: readonly Book[];
  className?: string;
};

function bookCountLabel(count: number): string {
  return `${count} ${count === 1 ? "book" : "books"}`;
}

/**
 * Related books as compact thumbnail rows (not near-full-width BookCard covers).
 */
export function RelatedBooksSection({ books, className = "" }: RelatedBooksSectionProps) {
  if (books.length === 0) return null;

  return (
    <section className={`min-w-0 ${className}`.trim()} aria-labelledby="related-books-heading">
      <h2 id="related-books-heading" className="text-[11px] uppercase tracking-[0.24em] text-muted">
        Related books
        <span className="mt-0.5 block text-[11px] normal-case tracking-normal text-muted/80">
          {bookCountLabel(books.length)}
        </span>
      </h2>
      <ul className="mt-4 border-t border-border/35">
        {books.map((book) => (
          <li key={book.id}>
            <CompactBookRow book={book} ctaLabel="View book" />
          </li>
        ))}
      </ul>
    </section>
  );
}

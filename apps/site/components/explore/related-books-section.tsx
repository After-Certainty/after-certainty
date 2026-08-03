import { CompactBookRow } from "@/components/explore/compact-book-row";
import { RelatedSectionDisclosure } from "@/components/explore/related-section-disclosure";
import type { Book } from "@/types/semanticGraph";

type RelatedBooksSectionProps = {
  books: readonly Book[];
  className?: string;
  /**
   * Collapse behind RelatedSectionDisclosure on mobile (atlas detail Phase 3).
   * Patterns detail keeps books always visible.
   */
  collapsible?: boolean;
};

function bookCountLabel(count: number): string {
  return `${count} ${count === 1 ? "book" : "books"}`;
}

/**
 * Related books as compact thumbnail rows (not near-full-width BookCard covers).
 */
export function RelatedBooksSection({
  books,
  className = "",
  collapsible = false,
}: RelatedBooksSectionProps) {
  if (books.length === 0) return null;

  const list = (
    <ul className={collapsible ? "border-t border-border/35 md:mt-0" : "mt-4 border-t border-border/35"}>
      {books.map((book) => (
        <li key={book.id}>
          <CompactBookRow book={book} ctaLabel="View book" />
        </li>
      ))}
    </ul>
  );

  if (collapsible) {
    return (
      <RelatedSectionDisclosure
        id="related-books"
        title="Related books"
        countLabel={bookCountLabel(books.length)}
        className={className}
      >
        {list}
      </RelatedSectionDisclosure>
    );
  }

  return (
    <section className={`min-w-0 ${className}`.trim()} aria-labelledby="related-books-heading">
      <h2 id="related-books-heading" className="text-[11px] uppercase tracking-[0.24em] text-muted">
        Related books
        <span className="mt-0.5 block text-[11px] normal-case tracking-normal text-muted/80">
          {bookCountLabel(books.length)}
        </span>
      </h2>
      {list}
    </section>
  );
}

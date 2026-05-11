import type { Metadata } from "next";
import { BooksClosingQuote } from "@/components/books/books-closing-quote";
import { BooksFeatured } from "@/components/books/books-featured";
import { BooksHero } from "@/components/books/books-hero";
import { BooksLibraryGrid } from "@/components/books/books-library-grid";
import { BooksOngoing } from "@/components/books/books-ongoing";
import { BooksOpenPublishing } from "@/components/books/books-open-publishing";
import { BooksThemes } from "@/components/books/books-themes";
import {
  getBooks,
  getCatalogLibraryBooks,
  getFeaturedCatalogBook,
  getOngoingWorks,
} from "@/lib/content-data";
import { mergeCatalogThemes } from "@/lib/catalog-themes";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Books",
  description:
    "Long-form works in the After Certainty commons — a curated catalog of books, drafts, and open revision.",
});

export default function BooksPage() {
  const allBooks = getBooks();
  const featured = getFeaturedCatalogBook();
  const library = getCatalogLibraryBooks();
  const ongoing = getOngoingWorks();
  const themes = mergeCatalogThemes(allBooks);

  return (
    <article>
      <BooksHero books={allBooks} />
      {featured ? <BooksFeatured book={featured} /> : null}
      <BooksLibraryGrid books={library} />
      <BooksThemes themes={themes} />
      <BooksOpenPublishing />
      <BooksOngoing works={ongoing} />
      <BooksClosingQuote />
    </article>
  );
}

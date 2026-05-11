import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Book } from "@/types/content";
import { BookCard } from "@/components/books/book-card";

export function BooksLibraryGrid({ books }: { books: Book[] }) {
  return (
    <Section atmosphere="transition" className="border-b border-border/35 bg-bg-elevated/[0.06] py-20 md:py-28">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">In the library</h2>
          <p className="mt-5 text-muted">
            Each title is revised in public where possible — editions deepen as conversations accumulate.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

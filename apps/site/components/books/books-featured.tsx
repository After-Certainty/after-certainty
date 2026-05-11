import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { Book } from "@/types/content";
import { FeaturedBook } from "@/components/books/featured-book";

export function BooksFeatured({ book }: { book: Book }) {
  return (
    <Section atmosphere="none" className="border-b border-border/35 bg-bg py-20 md:py-28">
      <Container>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Featured work</p>
        <FeaturedBook book={book} />
      </Container>
    </Section>
  );
}

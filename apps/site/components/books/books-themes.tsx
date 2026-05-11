import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ThemeTag } from "@/components/books/theme-tag";

export function BooksThemes({ themes }: { themes: string[] }) {
  return (
    <Section atmosphere="none" className="border-b border-border/35 bg-bg py-20 md:py-24">
      <Container className="max-w-3xl">
        <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">Themes & patterns</h2>
        <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
          The books share overlapping concerns and recurring patterns, but approach them from different lenses and scales.
        </p>
        <ul className="mt-10 flex flex-wrap gap-2.5">
          {themes.map((t) => (
            <li key={t}>
              <ThemeTag>{t}</ThemeTag>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

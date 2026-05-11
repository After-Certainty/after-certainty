import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function BooksClosingQuote() {
  return (
    <Section atmosphere="quote" className="relative border-b border-border/30 bg-bg/[0.06] py-28 md:py-36">
      <span className="atm-quote-paper-hint" aria-hidden />
      <Container className="relative z-10 mx-auto max-w-3xl text-center">
        <blockquote className="font-display text-2xl font-normal leading-snug tracking-tight text-fg md:text-4xl md:leading-tight">
          Books are not final answers.
          <br />
          <span className="text-fg/95">They are places where conversations become durable.</span>
        </blockquote>
      </Container>
    </Section>
  );
}

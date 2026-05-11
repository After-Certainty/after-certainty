import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function PatternsClosingQuote() {
  return (
    <Section atmosphere="quote" className="py-24 md:py-32">
      <Container className="relative z-[1] max-w-3xl text-center">
        <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight text-fg md:text-4xl">
          &ldquo;Patterns do not remove uncertainty.
          <br className="hidden sm:block" />{" "}
          <span className="text-accent/95">They make recurring structures easier to notice together.</span>&rdquo;
        </blockquote>
      </Container>
    </Section>
  );
}

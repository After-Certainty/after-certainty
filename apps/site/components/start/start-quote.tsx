import { Container } from "@/components/ui/container";

export function StartQuote() {
  return (
    <section className="atm-section atm-section--quote relative border-b border-border/30 bg-bg/[0.08] py-12 md:py-36">
      <span className="atm-quote-paper-hint" aria-hidden />
      <Container className="relative z-10 mx-auto max-w-3xl text-center">
        <blockquote className="font-display text-xl font-normal leading-snug tracking-tight text-fg md:text-4xl md:leading-tight">
          We do not need more certainty.
          <br />
          <span className="text-fg/95">We need better ways to think together.</span>
        </blockquote>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted md:mt-12 md:text-lg">
          The project exists because modern systems increasingly struggle to create shared
          understanding at human scale.
        </p>
      </Container>
    </section>
  );
}

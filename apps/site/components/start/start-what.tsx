import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function StartWhat() {
  return (
    <Section atmosphere="none" className="border-b border-border/35 bg-bg py-24 md:py-32">
      <Container className="max-w-2xl text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
          What Is After Certainty?
        </h2>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-muted md:text-lg">
          <p>
            After Certainty is a collaborative publishing and conversation project exploring meaning, trust,
            leadership, communication, authority, interpretation, and human coordination under uncertainty.
          </p>
          <p>
            The project includes books, essays, podcasts, patterns, and open collaboration. It is intentionally
            open-ended and evolving.
          </p>
        </div>
        <div className="mx-auto mt-14 h-px max-w-xs bg-gradient-to-r from-transparent via-accent/35 to-transparent" aria-hidden />
      </Container>
    </Section>
  );
}

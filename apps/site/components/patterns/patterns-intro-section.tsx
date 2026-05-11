import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function PatternsIntroSection() {
  return (
    <Section atmosphere="none" className="border-b border-border/35 py-20 md:py-28">
      <Container className="max-w-2xl">
        <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">Why patterns?</h2>
        <div className="mt-8 space-y-6 text-base leading-[1.85] text-muted md:text-[17px]">
          <p>Complex systems often resist simple explanations.</p>
          <p>
            Patterns help make recurring dynamics visible without pretending that every situation is identical. They
            allow conversations about leadership, meaning, institutions, trust, communication, and coordination to become
            more grounded, more discussable, and more shareable.
          </p>
        </div>
      </Container>
    </Section>
  );
}

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function PodcastPhilosophy() {
  return (
    <Section atmosphere="quote" className="border-b border-border/35 py-24 md:py-32">
      <Container className="relative z-[1] max-w-3xl">
        <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight text-fg md:text-3xl">
          &ldquo;Some conversations are valuable not because they resolve uncertainty, but because they make shared
          understanding possible.&rdquo;
        </blockquote>
        <p className="mt-10 max-w-2xl text-base leading-[1.8] text-muted md:text-[17px]">
          The podcast extends the broader After Certainty project through reflective conversations, evolving questions,
          and collaborative exploration.
        </p>
      </Container>
    </Section>
  );
}

import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function StartWhatsNewSection() {
  return (
    <Section atmosphere="none" className="border-b border-border/40 py-14 md:py-16">
      <Container>
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Continuing work</p>
        <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
          What’s New
        </h2>
        <p className="mt-4 max-w-2xl text-muted md:text-lg">
          After Certainty is an evolving project. Browse recent publications, revisions, podcast
          episodes, and site features in chronological order.
        </p>
        <p className="mt-8">
          <Link
            href="/whats-new"
            className="text-sm uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            See what changed →
          </Link>
        </p>
      </Container>
    </Section>
  );
}

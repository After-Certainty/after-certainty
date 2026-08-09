import Link from "next/link";

import { Container } from "@/components/ui/container";

export function StartWhatsNewSection() {
  return (
    <section className="border-b border-border/40 py-6 md:py-16">
      <Container>
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Continuing work</p>
        <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-fg md:mt-4 md:text-4xl">
          What’s New
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted md:mt-4 md:text-lg">
          After Certainty is an evolving project. Browse recent publications, revisions, podcast
          episodes, and site features in chronological order.
        </p>
        <p className="mt-5 md:mt-8">
          <Link
            href="/whats-new"
            className="text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:text-sm"
          >
            See what changed →
          </Link>
        </p>
      </Container>
    </section>
  );
}

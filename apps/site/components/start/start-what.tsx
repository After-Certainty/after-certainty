import Link from "next/link";

import { Container } from "@/components/ui/container";

/**
 * Short About beat below Start Here onboarding choices.
 */
export function StartWhat() {
  return (
    <section className="border-b border-border/35 bg-bg py-6 md:py-14">
      <Container className="max-w-2xl">
        <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
          About After Certainty
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted md:mt-4 md:text-base">
          After Certainty is a collaborative publishing and conversation project exploring meaning,
          trust, leadership, communication, and human coordination under uncertainty. It includes
          books, essays, podcasts, patterns, and open collaboration—intentionally open-ended and
          evolving.
        </p>
        <Link
          href="/about"
          className="mt-5 inline-block text-xs uppercase tracking-[0.22em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:mt-6"
        >
          About the project →
        </Link>
      </Container>
    </section>
  );
}

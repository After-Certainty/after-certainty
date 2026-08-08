import Link from "next/link";

import { Container } from "@/components/ui/container";

/**
 * Compressed homepage mission — reflective beat after interactive Pattern Recognition.
 */
export function WhyProjectExistsSection() {
  return (
    <section
      className="border-b border-border/40 bg-bg-elevated/18 py-6 md:py-12"
      aria-labelledby="why-project-exists-heading"
    >
      <Container>
        <div className="max-w-2xl">
          <h2
            id="why-project-exists-heading"
            className="text-[10px] font-normal uppercase tracking-[0.28em] text-accent md:text-xs"
          >
            Why this project exists
          </h2>
          <blockquote className="mt-4 font-display text-xl leading-snug text-fg md:mt-5 md:text-2xl md:leading-tight">
            We live in a time when certainty is everywhere, and understanding is scarce.
          </blockquote>
          <div className="mt-5 h-px w-10 bg-accent/55" aria-hidden />
          <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
            After Certainty is an intellectual commons for reading, listening, and thinking together
            when easy answers fail.
          </p>
          <Link
            href="/about"
            className="mt-6 inline-block text-xs uppercase tracking-[0.22em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            About the project →
          </Link>
        </div>
      </Container>
    </section>
  );
}

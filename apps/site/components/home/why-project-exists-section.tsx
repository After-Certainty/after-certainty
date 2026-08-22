import Link from "next/link";

import { Container } from "@/components/ui/container";

/**
 * Compressed homepage mission — reflective beat after Explore / What’s New activity.
 * Desktop: asymmetric two-column editorial close.
 */
export function WhyProjectExistsSection() {
  return (
    <section
      className="border-b border-border/40 bg-bg-elevated/18 py-6 md:py-12 lg:py-14"
      aria-labelledby="why-project-exists-heading"
    >
      <Container>
        <div className="md:grid md:grid-cols-12 md:items-start md:gap-10 lg:gap-14">
          <div className="md:col-span-6 lg:col-span-7">
            <h2
              id="why-project-exists-heading"
              className="text-[10px] font-normal uppercase tracking-[0.28em] text-accent md:text-xs"
            >
              Why this project exists
            </h2>
            <blockquote className="mt-4 font-display text-xl leading-snug text-fg md:mt-5 md:text-3xl md:leading-tight lg:text-[2rem]">
              We live in a time when certainty is everywhere, and understanding is scarce.
            </blockquote>
            <div className="mt-5 h-px w-10 bg-accent/55 md:hidden" aria-hidden />
          </div>
          <div className="mt-5 md:col-span-6 md:mt-0 md:border-l md:border-border/40 md:pl-10 lg:col-span-5 lg:pl-12">
            <p className="text-sm leading-relaxed text-muted md:text-base">
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
        </div>
      </Container>
    </section>
  );
}

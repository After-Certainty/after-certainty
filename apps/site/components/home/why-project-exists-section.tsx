import Link from "next/link";

import { Container } from "@/components/ui/container";

/**
 * Homepage idea beat — short recognition of the human problem, then a path to About.
 * Placed early so visitors meet the idea before the project architecture.
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
              We build simplified answers so we can act. Trouble begins when we mistake those
              answers for the whole of reality.
            </blockquote>
            <div className="mt-5 h-px w-10 bg-accent/55 md:hidden" aria-hidden />
          </div>
          <div className="mt-5 md:col-span-6 md:mt-0 md:border-l md:border-border/40 md:pl-10 lg:col-span-5 lg:pl-12">
            <p className="text-sm leading-relaxed text-muted md:text-base">
              Politics, expertise, institutions, models, and the stories we tell one another help us
              coordinate without understanding everything from scratch. When life moves quickly,
              confident simple answers become especially appealing—and we start sorting ourselves
              around the explanations that already fit.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              After Certainty is about learning to see through perspectives other than our own,
              staying honest about what we don’t know, and still making decisions with finite time.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block text-xs uppercase tracking-[0.22em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Read more about the idea →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

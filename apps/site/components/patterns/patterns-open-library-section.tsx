import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/lib/site-config";

export function PatternsOpenLibrarySection() {
  return (
    <Section atmosphere="none" className="border-b border-border/35 py-20 md:py-28">
      <Container className="max-w-2xl">
        <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">An evolving library</h2>
        <p className="mt-6 text-base leading-[1.85] text-muted md:text-[17px]">
          The pattern library is intentionally open-ended. New books, essays, conversations, and collaborators may extend,
          challenge, refine, or reinterpret the patterns over time.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <Link
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center border border-border/55 px-6 py-3 text-xs uppercase tracking-[0.22em] text-fg transition-colors hover:border-accent/35 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            GitHub repository
          </Link>
          <Link
            href="/collaborators"
            className="inline-flex min-h-[44px] items-center justify-center border border-accent/35 bg-accent-soft px-6 py-3 text-xs uppercase tracking-[0.22em] text-accent transition-colors hover:bg-accent/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Collaborators
          </Link>
        </div>
      </Container>
    </Section>
  );
}

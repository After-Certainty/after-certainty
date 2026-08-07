import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { gamePaths } from "@/lib/games/paths";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Games",
  description:
    "Interactive ways to practice noticing recurring patterns in human systems.",
  alternates: { canonical: gamePaths.home },
});

export default function GamesIndexPage() {
  return (
    <Section>
      <Container>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">After Certainty</p>
        <h1 className="mt-3 font-display text-4xl text-fg">Games</h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-muted">
          Reflective practice spaces for recognizing patterns — not trivia, and not a
          scoreboard.
        </p>
        <ul className="mt-10">
          <li>
            <Link
              href={gamePaths.patternRecognition}
              className="block rounded-md border border-border/80 bg-bg-elevated/30 p-5 transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <p className="font-display text-2xl text-fg">Pattern Recognition Challenge</p>
              <p className="mt-2 font-sans text-sm text-muted">
                Read a scenario. Notice which pattern is strongest — and which others are
                also present.
              </p>
            </Link>
          </li>
        </ul>
      </Container>
    </Section>
  );
}

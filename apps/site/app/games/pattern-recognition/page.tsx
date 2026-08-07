import type { Metadata } from "next";
import Link from "next/link";

import { LobbyProgress } from "@/components/games/pattern-recognition/lobby-progress";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getEnrichedPublishedChallenges } from "@/lib/games/pattern-recognition/enrich";
import { gamePaths } from "@/lib/games/paths";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Pattern Recognition Challenge",
  description:
    "Practice noticing recurring patterns in human systems through short scenarios.",
  alternates: { canonical: gamePaths.patternRecognition },
});

export default async function PatternRecognitionLobbyPage() {
  const challenges = await getEnrichedPublishedChallenges();

  return (
    <Section>
      <Container>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Games</p>
        <h1 className="mt-3 font-display text-4xl text-fg">Pattern Recognition Challenge</h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-muted">
          Many situations contain more than one pattern. The practice is learning to notice
          what is strongest — without treating every other reading as failure.
        </p>

        <LobbyProgress publishedCount={challenges.length} />

        <h2 className="mt-12 font-display text-2xl text-fg">Browse challenges</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Single scenarios stay shareable. Daily and Practice run five at a time.
        </p>
        <ul className="mt-5 flex flex-col gap-3">
          {challenges.map((challenge) => (
            <li key={challenge.id}>
              <Link
                href={gamePaths.challenge(challenge.slug)}
                className="block rounded-md border border-border/80 px-4 py-4 transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <p className="font-sans text-base text-fg">{challenge.title}</p>
                <p className="mt-1 text-sm capitalize text-muted">{challenge.context}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

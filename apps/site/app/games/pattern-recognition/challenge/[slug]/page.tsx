import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RecognitionChallenge } from "@/components/games/pattern-recognition/recognition-challenge";
import { getEnrichedChallengeBySlug } from "@/lib/games/pattern-recognition/enrich";
import { getPublishedChallenges } from "@/lib/games/pattern-recognition/load";
import { gamePaths } from "@/lib/games/paths";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedChallenges().map((challenge) => ({ slug: challenge.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await getEnrichedChallengeBySlug(slug);
  if (!challenge) return {};
  return createPageMetadata({
    title: `${challenge.title} · Pattern Recognition Challenge`,
    description: challenge.scenario.slice(0, 160),
    alternates: { canonical: gamePaths.challenge(challenge.slug) },
  });
}

export default async function PatternRecognitionChallengePage({ params }: PageProps) {
  const { slug } = await params;
  const challenge = await getEnrichedChallengeBySlug(slug);
  if (!challenge) notFound();

  return (
    <main className="min-h-[100dvh] bg-bg text-fg">
      <RecognitionChallenge
        challengeId={challenge.id}
        slug={challenge.slug}
        title={challenge.title}
        scenario={challenge.scenario}
        context={challenge.context}
        explanation={challenge.explanation}
        dominantPattern={challenge.dominantPattern}
        secondaryPatterns={challenge.secondaryPatterns}
        distractorPatterns={challenge.distractorPatterns}
        choiceFeedback={challenge.choiceFeedback}
        insightXp={challenge.insightXp}
        choices={challenge.choices}
        titleByPatternId={challenge.titleByPatternId}
        dominantPatternHref={challenge.dominantPatternHref}
        relatedBookHref={challenge.relatedBookHref}
        relatedBookTitle={challenge.relatedBookTitle}
      />
    </main>
  );
}

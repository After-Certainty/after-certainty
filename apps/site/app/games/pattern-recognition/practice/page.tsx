import type { Metadata } from "next";

import { ChallengeSession } from "@/components/games/pattern-recognition/challenge-session";
import { loadPracticeChallengeSession } from "@/lib/games/pattern-recognition/session-load";
import { gamePaths } from "@/lib/games/paths";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Practice · Pattern Recognition Challenge",
  description: "A five-scenario practice set for noticing patterns in human systems.",
  alternates: { canonical: gamePaths.practice },
  robots: { index: false, follow: false },
});

export default async function PatternRecognitionPracticePage() {
  const session = await loadPracticeChallengeSession();

  if (!session || session.challenges.length === 0) {
    return (
      <main className="min-h-[100dvh] bg-bg text-fg">
        <div className="mx-auto max-w-xl space-y-4 px-4 py-10 sm:px-6">
          <h1 className="font-display text-3xl text-fg">Practice unavailable</h1>
          <p className="text-sm leading-relaxed text-muted">
            No published challenges are available yet.
          </p>
          <a
            href={gamePaths.patternRecognition}
            className="inline-flex min-h-11 items-center text-sm text-accent underline-offset-4 hover:underline"
          >
            Back to lobby
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-bg text-fg">
      <ChallengeSession
        mode={session.mode}
        challenges={session.challenges}
        sessionId={session.sessionId}
      />
    </main>
  );
}

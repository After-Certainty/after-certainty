import type { Metadata } from "next";

import { ChallengeSession } from "@/components/games/pattern-recognition/challenge-session";
import { DAILY_SESSION_SIZE } from "@/lib/games/pattern-recognition/daily";
import { loadDailyChallengeSession } from "@/lib/games/pattern-recognition/session-load";
import { gamePaths } from "@/lib/games/paths";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Daily Pattern Challenge",
  description: "Five scenarios for today's Pattern Recognition Challenge.",
  alternates: { canonical: gamePaths.daily },
  robots: { index: false, follow: false },
});

export default async function PatternRecognitionDailyPage() {
  const session = await loadDailyChallengeSession();

  if (!session || session.challenges.length < DAILY_SESSION_SIZE) {
    return (
      <main className="min-h-[100dvh] bg-bg text-fg">
        <div className="mx-auto max-w-xl space-y-4 px-4 py-10 sm:px-6">
          <h1 className="font-display text-3xl text-fg">Daily Challenge unavailable</h1>
          <p className="text-sm leading-relaxed text-muted">
            The published challenge pool needs at least {DAILY_SESSION_SIZE} scenarios before
            Daily mode can run.
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
        dailyDate={session.dailyDate}
        sessionId={session.sessionId}
      />
    </main>
  );
}

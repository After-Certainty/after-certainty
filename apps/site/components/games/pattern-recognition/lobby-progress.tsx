"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { gamePaths } from "@/lib/games/paths";
import { DAILY_SESSION_SIZE, getGameDateKey } from "@/lib/games/pattern-recognition/daily";
import {
  getPatternRecognitionServerSnapshot,
  getPatternRecognitionState,
  resetPatternRecognitionProgress,
  subscribePatternRecognition,
} from "@/lib/games/pattern-recognition/storage";
import { visibleCurrentStreak } from "@/lib/games/pattern-recognition/streaks";

type LobbyProgressProps = {
  publishedCount: number;
};

export function LobbyProgress({ publishedCount }: LobbyProgressProps) {
  const state = useSyncExternalStore(
    subscribePatternRecognition,
    getPatternRecognitionState,
    getPatternRecognitionServerSnapshot,
  );
  const today = getGameDateKey();
  const dailyDone = Boolean(state.dailyCompletions[today]);
  const streak = visibleCurrentStreak({
    currentStreak: state.currentStreak,
    lastDailyCompletionDate: state.lastDailyCompletionDate,
    todayDateKey: today,
  });
  const dailyReady = publishedCount >= DAILY_SESSION_SIZE;

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Your progress</p>
          <p className="mt-2 font-sans text-sm text-fg" data-testid="lobby-insight-xp">
            Insight XP: {state.totalInsightXp}
          </p>
          <p className="mt-1 font-sans text-sm text-muted" data-testid="lobby-streak">
            Daily streak: {streak} day{streak === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (
              typeof window !== "undefined" &&
              window.confirm("Reset local Pattern Recognition progress on this device?")
            ) {
              resetPatternRecognitionProgress();
            }
          }}
          className="min-h-11 text-sm text-muted underline-offset-4 hover:text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-testid="reset-progress"
        >
          Reset progress
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {dailyReady ? (
          <Link
            href={gamePaths.daily}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-fg px-5 text-sm font-medium text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            data-testid="start-daily"
          >
            {dailyDone ? "Replay today's Daily" : "Play Daily Challenge"}
          </Link>
        ) : (
          <span
            className="inline-flex min-h-11 items-center rounded-md border border-border px-5 text-sm text-muted"
            data-testid="daily-unavailable"
          >
            Daily needs {DAILY_SESSION_SIZE}+ published challenges
          </span>
        )}
        <Link
          href={gamePaths.practice}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-medium text-fg transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-testid="start-practice"
        >
          {dailyDone ? "Continue Practice" : "Practice"}
        </Link>
      </div>

      {dailyDone ? (
        <p className="text-sm text-muted" data-testid="daily-completed-note">
          Today&apos;s Daily is complete. Practice anytime — it won&apos;t break your streak.
        </p>
      ) : null}
    </div>
  );
}

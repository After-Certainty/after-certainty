"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { gamePaths } from "@/lib/games/paths";
import {
  trackGameStarted,
  trackSessionCompleted,
} from "@/lib/games/pattern-recognition/analytics";
import {
  DAILY_COMPLETION_BONUS_XP,
  getGameDateKey,
  type SessionMode,
} from "@/lib/games/pattern-recognition/daily";
import { buildSessionPatterns } from "@/lib/games/pattern-recognition/delight";
import type { EnrichedChallenge } from "@/lib/games/pattern-recognition/enrich";
import {
  completeDailySession,
  getPatternRecognitionServerSnapshot,
  getPatternRecognitionState,
  subscribePatternRecognition,
} from "@/lib/games/pattern-recognition/storage";
import { visibleCurrentStreak } from "@/lib/games/pattern-recognition/streaks";
import type { ChallengeFeedback } from "@/types/challenges";

import { RecognitionChallenge } from "./recognition-challenge";
import { SessionCompleteDelight } from "./session-complete-delight";

type ChallengeSessionProps = {
  mode: SessionMode;
  challenges: EnrichedChallenge[];
  dailyDate?: string;
  sessionId: string;
};

function toViewModel(challenge: EnrichedChallenge) {
  return {
    challengeId: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    scenario: challenge.scenario,
    context: challenge.context,
    explanation: challenge.explanation,
    dominantPattern: challenge.dominantPattern,
    secondaryPatterns: challenge.secondaryPatterns,
    distractorPatterns: challenge.distractorPatterns,
    choiceFeedback: challenge.choiceFeedback,
    insightXp: challenge.insightXp,
    choices: challenge.choices,
    titleByPatternId: challenge.titleByPatternId,
    dominantPatternHref: challenge.dominantPatternHref,
    relatedBookHref: challenge.relatedBookHref,
    relatedBookTitle: challenge.relatedBookTitle,
    relatedChapterHref: challenge.relatedChapterHref,
    relatedChapterTitle: challenge.relatedChapterTitle,
    relatedPodcastHref: challenge.relatedPodcastHref,
    relatedPodcastTitle: challenge.relatedPodcastTitle,
    relatedPodcastExternal: challenge.relatedPodcastExternal,
    relatedPodcastEpisodeId: challenge.relatedPodcastEpisodeId,
    relatedSituationHref: challenge.relatedSituationHref,
    relatedSituationTitle: challenge.relatedSituationTitle,
  };
}

export function ChallengeSession({
  mode,
  challenges,
  dailyDate,
  sessionId,
}: ChallengeSessionProps) {
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [claimedBonusThisRun, setClaimedBonusThisRun] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [dominantCount, setDominantCount] = useState(0);
  const startedRef = useRef(false);
  const dominantCountRef = useRef(0);
  const sessionXpRef = useRef(0);
  const state = useSyncExternalStore(
    subscribePatternRecognition,
    getPatternRecognitionState,
    getPatternRecognitionServerSnapshot,
  );

  const total = challenges.length;
  const current = challenges[index];
  const alreadyCompletedToday = useMemo(() => {
    if (mode !== "daily" || !dailyDate) return false;
    return Boolean(state.dailyCompletions[dailyDate]);
  }, [dailyDate, mode, state.dailyCompletions]);

  const streak = visibleCurrentStreak({
    currentStreak: state.currentStreak,
    lastDailyCompletionDate: state.lastDailyCompletionDate,
    todayDateKey: dailyDate ?? getGameDateKey(),
  });

  const sessionPatterns = useMemo(() => buildSessionPatterns(challenges), [challenges]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackGameStarted({ mode });
  }, [mode]);

  const onAnswered = useCallback((feedback: ChallengeFeedback) => {
    sessionXpRef.current += feedback.xpAwarded;
    if (feedback.outcome === "dominant") {
      dominantCountRef.current += 1;
    }
  }, []);

  const onContinue = useCallback(() => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      return;
    }
    let bonus = 0;
    if (mode === "daily" && dailyDate && !alreadyCompletedToday) {
      completeDailySession({
        dateKey: dailyDate,
        sessionId,
        challengeIds: challenges.map((challenge) => challenge.id),
      });
      setClaimedBonusThisRun(true);
      bonus = DAILY_COMPLETION_BONUS_XP;
    }
    trackSessionCompleted({
      mode,
      questionCount: total,
      dominantCount: dominantCountRef.current,
    });
    setSessionXp(sessionXpRef.current + bonus);
    setDominantCount(dominantCountRef.current);
    setFinished(true);
  }, [alreadyCompletedToday, challenges, dailyDate, index, mode, sessionId, total]);

  if (finished) {
    const footnote =
      mode === "daily" ? (
        <>
          {claimedBonusThisRun
            ? `Includes +${DAILY_COMPLETION_BONUS_XP} Insight XP for finishing the daily set.`
            : "You already claimed today's completion bonus earlier."}{" "}
          Current streak: {streak} day{streak === 1 ? "" : "s"}.
        </>
      ) : (
        <>Practice does not affect your daily streak. Your Pattern Memory still updated.</>
      );

    return (
      <SessionCompleteDelight
        mode={mode}
        patterns={sessionPatterns}
        insightXp={sessionXp}
        challengeCount={total}
        dominantCount={dominantCount}
        footnote={footnote}
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href={gamePaths.patternRecognition}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-fg px-5 text-sm font-medium text-bg"
          >
            Back to lobby
          </Link>
          {mode === "practice" ? (
            <Link
              href={gamePaths.practice}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-medium text-fg"
            >
              Another practice set
            </Link>
          ) : null}
        </div>
      </SessionCompleteDelight>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-sm text-muted">
        No challenges available for this session.
      </div>
    );
  }

  const isLast = index + 1 >= total;

  return (
    <RecognitionChallenge
      key={`${sessionId}-${current.slug}`}
      {...toViewModel(current)}
      mode={mode}
      eyebrow={mode === "daily" ? "Daily Pattern Challenge" : "Practice"}
      questionIndex={index + 1}
      questionCount={total}
      dailyDate={dailyDate}
      sessionId={sessionId}
      onAnswered={onAnswered}
      onContinue={onContinue}
      continueLabel={isLast ? "See results" : "Next question"}
    />
  );
}

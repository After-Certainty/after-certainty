"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { explorePaths } from "@/lib/graph/explorePaths";
import { gamePaths } from "@/lib/games/paths";
import {
  itemIdFromPath,
  relatedContentAnalytics,
  trackChallengeAnswered,
  trackChallengeCompleted,
  trackGameStarted,
  trackRelatedContentOpened,
} from "@/lib/games/pattern-recognition/analytics";
import { formatContextLabel } from "@/lib/games/pattern-recognition/memory";
import { buildFeedback } from "@/lib/games/pattern-recognition/scoring";
import {
  getPatternMemoryEntry,
  getTotalInsightXp,
  getTotalInsightXpServerSnapshot,
  recordChallengeAttempt,
  subscribePatternRecognition,
} from "@/lib/games/pattern-recognition/storage";
import type { ChallengeFeedback, PatternChoice } from "@/types/challenges";

export type RecognitionChallengeViewModel = {
  challengeId: string;
  slug: string;
  title: string;
  scenario: string;
  context: string;
  explanation: string;
  dominantPattern: string;
  secondaryPatterns: string[];
  distractorPatterns: string[];
  choiceFeedback?: Record<string, string>;
  insightXp?: { dominant?: number; secondary?: number; distractor?: number };
  choices: PatternChoice[];
  titleByPatternId: Record<string, string>;
  dominantPatternHref: string;
  relatedBookHref?: string;
  relatedBookTitle?: string;
  relatedChapterHref?: string;
  relatedChapterTitle?: string;
  relatedPodcastHref?: string;
  relatedPodcastTitle?: string;
  relatedPodcastExternal?: boolean;
  relatedPodcastEpisodeId?: string | null;
  relatedSituationHref?: string;
  relatedSituationTitle?: string;
};

export type RecognitionChallengeProps = RecognitionChallengeViewModel & {
  mode?: "daily" | "practice" | "single";
  eyebrow?: string;
  questionIndex?: number;
  questionCount?: number;
  sessionId?: string;
  dailyDate?: string;
  showExit?: boolean;
  onAnswered?: (feedback: ChallengeFeedback) => void;
  onContinue?: () => void;
  continueLabel?: string;
};

const relatedLinkClassName =
  "inline-flex min-h-11 items-center rounded-md border border-border/80 px-3 py-2 font-sans text-sm text-fg transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function RecognitionChallenge(props: RecognitionChallengeProps) {
  const {
    scenario,
    choices,
    titleByPatternId,
    dominantPatternHref,
    relatedBookHref,
    relatedBookTitle,
    relatedChapterHref,
    relatedChapterTitle,
    relatedPodcastHref,
    relatedPodcastTitle,
    relatedPodcastExternal,
    relatedPodcastEpisodeId,
    relatedSituationHref,
    relatedSituationTitle,
    mode = "single",
    eyebrow = "Pattern Recognition Challenge",
    questionIndex,
    questionCount,
    sessionId,
    dailyDate,
    showExit = true,
    onAnswered,
    onContinue,
    continueLabel = "Next question",
  } = props;

  const feedbackId = useId();
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ChallengeFeedback | null>(null);
  const [memoryContexts, setMemoryContexts] = useState<string[]>([]);
  const [memoryCount, setMemoryCount] = useState(0);
  const recordedRef = useRef(false);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const totalXp = useSyncExternalStore(
    subscribePatternRecognition,
    getTotalInsightXp,
    getTotalInsightXpServerSnapshot,
  );

  useEffect(() => {
    // Session modes fire game_started from ChallengeSession once per pack.
    if (mode !== "single" || startedRef.current) return;
    startedRef.current = true;
    trackGameStarted({ mode });
  }, [mode]);

  useEffect(() => {
    if (!feedback || !feedbackRef.current) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    feedbackRef.current.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
    });
    feedbackRef.current.focus({ preventScroll: true });
  }, [feedback]);

  function onSelect(patternId: string) {
    if (feedback) return;
    setSelectedPatternId(patternId);
    const next = buildFeedback({
      challenge: {
        id: props.challengeId,
        slug: props.slug,
        title: props.title,
        mode: "recognition",
        status: "published",
        difficulty: "introductory",
        context: props.context,
        scenario: props.scenario,
        dominantPattern: props.dominantPattern,
        secondaryPatterns: props.secondaryPatterns,
        distractorPatterns: props.distractorPatterns,
        explanation: props.explanation,
        choiceFeedback: props.choiceFeedback,
        insightXp: props.insightXp,
      },
      selectedPatternId: patternId,
      titleByPatternId,
    });
    setFeedback(next);
    if (!recordedRef.current) {
      recordedRef.current = true;
      const state = recordChallengeAttempt({
        challengeId: props.challengeId,
        selectedPatternId: patternId,
        outcome: next.outcome,
        context: props.context,
        xpAwarded: next.xpAwarded,
        mode,
        sessionId,
        dailyDate,
        dominantPatternId: props.dominantPattern,
        secondaryPatternIds: props.secondaryPatterns,
      });
      const memory = state.patternMemory[props.dominantPattern];
      setMemoryCount(memory?.contexts.length ?? 0);
      setMemoryContexts(memory?.contexts ?? []);
      trackChallengeAnswered({
        challengeId: props.challengeId,
        outcome: next.outcome,
        mode,
      });
      trackChallengeCompleted({
        challengeId: props.challengeId,
        outcome: next.outcome,
      });
      onAnswered?.(next);
    } else {
      const memory = getPatternMemoryEntry(props.dominantPattern);
      setMemoryCount(memory?.contexts.length ?? 0);
      setMemoryContexts(memory?.contexts ?? []);
    }
  }

  const progressLabel =
    questionIndex != null && questionCount != null
      ? `Question ${questionIndex} of ${questionCount}`
      : null;

  const podcastItemId = relatedPodcastEpisodeId?.startsWith("podcast:")
    ? relatedPodcastEpisodeId.slice("podcast:".length)
    : (relatedPodcastEpisodeId ?? undefined);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-16 pt-4 sm:px-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sans text-xs uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
          <h1 className="mt-2 font-display text-2xl text-fg sm:text-3xl">
            What pattern do you see?
          </h1>
        </div>
        {showExit ? (
          <Link
            href={gamePaths.patternRecognition}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-fg transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Exit challenge"
            data-testid="exit-challenge"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </Link>
        ) : null}
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        {isClient ? (
          <p data-testid="insight-xp-total" aria-live="polite">
            Insight XP: {totalXp}
          </p>
        ) : (
          <span />
        )}
        {progressLabel ? (
          <p data-testid="question-progress" aria-live="polite">
            {progressLabel}
          </p>
        ) : null}
      </div>

      <section
        aria-label="Scenario"
        className="rounded-md border border-border/80 bg-bg-elevated/40 p-5"
      >
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Scenario</p>
        <p className="mt-3 font-sans text-base leading-relaxed text-fg">{scenario}</p>
      </section>

      <div
        role="group"
        aria-label="Pattern choices"
        aria-describedby={feedback ? feedbackId : undefined}
        className="flex flex-col gap-3"
      >
        {choices.map((choice) => {
          const selected = selectedPatternId === choice.patternId;
          const isDominant =
            feedback != null && choice.patternId === props.dominantPattern;
          return (
            <button
              key={choice.patternId}
              type="button"
              disabled={feedback != null}
              onClick={() => onSelect(choice.patternId)}
              className={[
                "min-h-11 rounded-md border px-4 py-3 text-left font-sans text-base transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                "disabled:cursor-default",
                selected || isDominant
                  ? "border-accent bg-accent-soft/40 text-fg"
                  : "border-border/90 bg-transparent text-fg hover:border-accent/40",
              ].join(" ")}
              aria-pressed={selected}
            >
              {choice.title}
            </button>
          );
        })}
      </div>

      {feedback ? (
        <div
          ref={feedbackRef}
          id={feedbackId}
          role="status"
          aria-live="polite"
          tabIndex={-1}
          className="rounded-md border border-border bg-bg-elevated/50 p-5 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-testid="challenge-feedback"
        >
          <p className="font-sans text-base font-medium text-fg">
            <span aria-hidden="true">✓ </span>
            {feedback.headline}
          </p>
          <p className="mt-3 font-sans text-base leading-relaxed text-fg">{feedback.body}</p>
          <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
            {feedback.explanation}
          </p>
          <p className="mt-4 text-sm text-accent" data-testid="challenge-xp-award">
            +{feedback.xpAwarded} Insight XP
          </p>

          <div className="mt-5 flex flex-col gap-2" aria-label="Related corpus links">
            <TrackedLink
              href={dominantPatternHref}
              className="inline-flex min-h-11 items-center font-sans text-sm text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              data-testid="read-the-pattern"
              analytics={relatedContentAnalytics(
                props.challengeId,
                "pattern",
                props.dominantPattern,
              )}
            >
              Read the Pattern →
            </TrackedLink>
            {relatedBookHref && relatedBookTitle ? (
              <TrackedLink
                href={relatedBookHref}
                className={relatedLinkClassName}
                data-testid="related-book"
                analytics={relatedContentAnalytics(
                  props.challengeId,
                  "book",
                  itemIdFromPath(relatedBookHref),
                )}
              >
                Related Book: {relatedBookTitle}
              </TrackedLink>
            ) : null}
            {relatedChapterHref && relatedChapterTitle ? (
              <TrackedLink
                href={relatedChapterHref}
                className={relatedLinkClassName}
                data-testid="related-chapter"
                analytics={relatedContentAnalytics(
                  props.challengeId,
                  "chapter",
                  itemIdFromPath(relatedChapterHref),
                )}
              >
                Related Chapter: {relatedChapterTitle}
              </TrackedLink>
            ) : null}
            {relatedSituationHref && relatedSituationTitle ? (
              <TrackedLink
                href={relatedSituationHref}
                className={relatedLinkClassName}
                data-testid="related-situation"
                analytics={relatedContentAnalytics(
                  props.challengeId,
                  "situation",
                  itemIdFromPath(relatedSituationHref),
                )}
              >
                Related Situation: {relatedSituationTitle}
              </TrackedLink>
            ) : null}
            {relatedPodcastHref && relatedPodcastTitle ? (
              relatedPodcastExternal ? (
                <a
                  href={relatedPodcastHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={relatedLinkClassName}
                  data-testid="related-podcast"
                  onClick={() => {
                    if (!podcastItemId) return;
                    trackRelatedContentOpened({
                      challengeId: props.challengeId,
                      contentType: "podcast",
                      itemId: podcastItemId,
                    });
                  }}
                >
                  Related Podcast: {relatedPodcastTitle}
                </a>
              ) : (
                <TrackedLink
                  href={relatedPodcastHref}
                  className={relatedLinkClassName}
                  data-testid="related-podcast"
                  analytics={
                    podcastItemId
                      ? relatedContentAnalytics(props.challengeId, "podcast", podcastItemId)
                      : undefined
                  }
                >
                  Related Podcast: {relatedPodcastTitle}
                </TrackedLink>
              )
            ) : null}
          </div>

          {feedback.secondaryPatternIds.length > 0 ? (
            <div className="mt-5 border-t border-border/70 pt-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Also visible</p>
              <ul className="mt-2 flex flex-wrap gap-2" aria-label="Secondary patterns">
                {feedback.secondaryPatternIds.map((patternId) => (
                  <li key={patternId}>
                    <TrackedLink
                      href={`${explorePaths.patterns}/${patternId}`}
                      className="inline-flex min-h-9 items-center rounded-full border border-border/80 px-3 py-1.5 text-sm text-fg hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      analytics={relatedContentAnalytics(
                        props.challengeId,
                        "pattern",
                        patternId,
                      )}
                    >
                      {titleByPatternId[patternId] ?? patternId}
                    </TrackedLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {memoryCount > 0 ? (
            <div
              className="mt-5 rounded-md border border-border/70 bg-bg/40 p-4"
              data-testid="pattern-memory"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Pattern Memory</p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-fg">
                You&apos;ve recognized{" "}
                <span className="font-medium">
                  {titleByPatternId[props.dominantPattern] ?? props.dominantPattern}
                </span>{" "}
                across {memoryCount} {memoryCount === 1 ? "context" : "contexts"}
                {memoryContexts.length > 0 ? ":" : "."}
              </p>
              {memoryContexts.length > 0 ? (
                <p className="mt-2 text-sm text-muted">
                  {memoryContexts.map(formatContextLabel).join(" · ")}
                </p>
              ) : null}
            </div>
          ) : null}

          {onContinue ? (
            <button
              type="button"
              onClick={onContinue}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-accent/60 bg-accent-soft px-4 py-3 font-sans text-sm uppercase tracking-[0.16em] text-accent transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              data-testid="continue-session"
            >
              {continueLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

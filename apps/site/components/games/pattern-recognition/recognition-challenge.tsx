"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { explorePaths } from "@/lib/graph/explorePaths";
import { gamePaths } from "@/lib/games/paths";
import { buildFeedback } from "@/lib/games/pattern-recognition/scoring";
import {
  getTotalInsightXp,
  recordChallengeAttempt,
} from "@/lib/games/pattern-recognition/storage";
import type { ChallengeFeedback, PatternChoice } from "@/types/challenges";

export type RecognitionChallengeProps = {
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
};

export function RecognitionChallenge(props: RecognitionChallengeProps) {
  const {
    scenario,
    choices,
    titleByPatternId,
    dominantPatternHref,
    relatedBookHref,
    relatedBookTitle,
  } = props;

  const feedbackId = useId();
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ChallengeFeedback | null>(null);
  const [totalXp, setTotalXp] = useState<number | null>(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    setTotalXp(getTotalInsightXp());
  }, []);

  useEffect(() => {
    if (!feedback || !feedbackRef.current) return;
    feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
        mode: "single",
      });
      setTotalXp(state.totalInsightXp);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-16 pt-4 sm:px-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sans text-xs uppercase tracking-[0.18em] text-muted">
            Pattern Recognition Challenge
          </p>
          <h1 className="mt-2 font-display text-2xl text-fg sm:text-3xl">
            What pattern do you see?
          </h1>
        </div>
        <Link
          href={gamePaths.patternRecognition}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-fg transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Exit challenge"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </Link>
      </header>

      {totalXp != null ? (
        <p className="text-sm text-muted" data-testid="insight-xp-total">
          Insight XP: {totalXp}
        </p>
      ) : null}

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
          className="rounded-md border border-border bg-bg-elevated/50 p-5"
          data-testid="challenge-feedback"
        >
          <p className="font-sans text-base font-medium text-fg">✓ {feedback.headline}</p>
          <p className="mt-3 font-sans text-base leading-relaxed text-fg">{feedback.body}</p>
          <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
            {feedback.explanation}
          </p>
          <p className="mt-4 text-sm text-accent" data-testid="challenge-xp-award">
            +{feedback.xpAwarded} Insight XP
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <Link
              href={dominantPatternHref}
              className="inline-flex min-h-11 items-center font-sans text-sm text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              data-testid="read-the-pattern"
            >
              Read the Pattern →
            </Link>
            {relatedBookHref && relatedBookTitle ? (
              <Link
                href={relatedBookHref}
                className="inline-flex min-h-11 items-center rounded-md border border-border/80 px-3 py-2 font-sans text-sm text-fg transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Related Book: {relatedBookTitle}
              </Link>
            ) : null}
          </div>

          {feedback.secondaryPatternIds.length > 0 ? (
            <div className="mt-5 border-t border-border/70 pt-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Also visible</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {feedback.secondaryPatternIds.map((patternId) => (
                  <li key={patternId}>
                    <Link
                      href={`${explorePaths.patterns}/${patternId}`}
                      className="inline-flex min-h-9 items-center rounded-full border border-border/80 px-3 py-1.5 text-sm text-fg hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {titleByPatternId[patternId] ?? patternId}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

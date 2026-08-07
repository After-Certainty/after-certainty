import type {
  ChallengeDefinition,
  ChallengeFeedback,
  ChallengeOutcome,
  PatternChoice,
} from "@/types/challenges";

export const DEFAULT_INSIGHT_XP = {
  dominant: 25,
  secondary: 15,
  distractor: 5,
} as const;

export function classifyChoice(
  challenge: ChallengeDefinition,
  selectedPatternId: string,
): ChallengeOutcome {
  if (selectedPatternId === challenge.dominantPattern) return "dominant";
  if (challenge.secondaryPatterns.includes(selectedPatternId)) return "secondary";
  return "distractor";
}

export function xpForOutcome(
  challenge: ChallengeDefinition,
  outcome: ChallengeOutcome,
): number {
  const configured = challenge.insightXp?.[outcome];
  if (typeof configured === "number" && Number.isFinite(configured)) {
    return Math.max(0, Math.round(configured));
  }
  return DEFAULT_INSIGHT_XP[outcome];
}

/** Stable choice order for a challenge (deterministic, no RNG). */
export function buildChoices(
  challenge: ChallengeDefinition,
  titleByPatternId: Record<string, string>,
): PatternChoice[] {
  const toChoice = (patternId: string, role: PatternChoice["role"]): PatternChoice => ({
    patternId,
    title: titleByPatternId[patternId] ?? patternId,
    role,
  });

  const dominant = toChoice(challenge.dominantPattern, "dominant");
  // Prefer secondaries over distractors when more than three non-dominant options exist.
  const others = [
    ...[...challenge.secondaryPatterns].sort().map((id) => toChoice(id, "secondary")),
    ...[...challenge.distractorPatterns].sort().map((id) => toChoice(id, "distractor")),
  ].slice(0, 3);

  return [dominant, ...others].sort((a, b) => a.patternId.localeCompare(b.patternId));
}

export function buildFeedback(input: {
  challenge: ChallengeDefinition;
  selectedPatternId: string;
  titleByPatternId: Record<string, string>;
}): ChallengeFeedback {
  const { challenge, selectedPatternId, titleByPatternId } = input;
  const outcome = classifyChoice(challenge, selectedPatternId);
  const selectedPatternTitle =
    titleByPatternId[selectedPatternId] ?? selectedPatternId;
  const dominantPatternTitle =
    titleByPatternId[challenge.dominantPattern] ?? challenge.dominantPattern;
  const xpAwarded = xpForOutcome(challenge, outcome);
  const custom = challenge.choiceFeedback?.[selectedPatternId]?.trim();

  if (outcome === "dominant") {
    return {
      outcome,
      selectedPatternId,
      selectedPatternTitle,
      dominantPatternId: challenge.dominantPattern,
      dominantPatternTitle,
      headline: "Nice observation.",
      body: `The strongest pattern here is ${dominantPatternTitle}.`,
      explanation: challenge.explanation,
      secondaryPatternIds: challenge.secondaryPatterns,
      xpAwarded,
    };
  }

  if (outcome === "secondary") {
    return {
      outcome,
      selectedPatternId,
      selectedPatternTitle,
      dominantPatternId: challenge.dominantPattern,
      dominantPatternTitle,
      headline: "You noticed something real.",
      body:
        custom ||
        `You noticed ${selectedPatternTitle}. That's present here, but the strongest pattern is ${dominantPatternTitle}.`,
      explanation: challenge.explanation,
      secondaryPatternIds: challenge.secondaryPatterns,
      xpAwarded,
    };
  }

  return {
    outcome,
    selectedPatternId,
    selectedPatternTitle,
    dominantPatternId: challenge.dominantPattern,
    dominantPatternTitle,
    headline: "Keep looking.",
    body:
      custom ||
      `The strongest pattern here is ${dominantPatternTitle}.`,
    explanation: challenge.explanation,
    secondaryPatternIds: challenge.secondaryPatterns,
    xpAwarded,
  };
}

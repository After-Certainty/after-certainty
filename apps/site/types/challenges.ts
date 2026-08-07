import type { ChallengeInsightXp } from "@/types/semanticGraph";

export type ChallengeMode = "recognition";
export type ChallengeStatus = "draft" | "published" | "archived";
export type ChallengeDifficulty = "introductory" | "intermediate" | "ambiguous";
export type ChallengeOutcome = "dominant" | "secondary" | "distractor";

export type ChallengeDefinition = {
  id: string;
  slug: string;
  title: string;
  mode: ChallengeMode;
  status: ChallengeStatus;
  difficulty: ChallengeDifficulty;
  context: string;
  scenario: string;
  dominantPattern: string;
  secondaryPatterns: string[];
  distractorPatterns: string[];
  explanation: string;
  choiceFeedback?: Record<string, string>;
  insightXp?: ChallengeInsightXp;
  relatedBooks?: string[];
  relatedChapterIds?: string[];
  relatedPodcastEpisodeId?: string | null;
  relatedSituation?: string;
  tags?: string[];
  provenance?: string | null;
};

export type PatternChoice = {
  patternId: string;
  title: string;
  role: ChallengeOutcome;
};

export type ChallengeFeedback = {
  outcome: ChallengeOutcome;
  selectedPatternId: string;
  selectedPatternTitle: string;
  dominantPatternId: string;
  dominantPatternTitle: string;
  headline: string;
  body: string;
  explanation: string;
  secondaryPatternIds: string[];
  xpAwarded: number;
};

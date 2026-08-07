import { describe, expect, it } from "vitest";

import type { ChallengeDefinition } from "@/types/challenges";

import {
  DEFAULT_INSIGHT_XP,
  buildChoices,
  buildFeedback,
  classifyChoice,
  xpForOutcome,
} from "./scoring";

const challenge: ChallengeDefinition = {
  id: "challenge-hallway-workaround-exception",
  slug: "hallway-workaround-exception",
  title: "The temporary fix that never left",
  mode: "recognition",
  status: "published",
  difficulty: "introductory",
  context: "software",
  scenario: "A temporary workaround stays forever.",
  dominantPattern: "exceptions-are-forever",
  secondaryPatterns: ["structures-outlive-reasons", "learning-collapses"],
  distractorPatterns: ["dissent-is-welcomed", "feedback-drives-change"],
  explanation: "Temporary exceptions create new dependencies.",
  choiceFeedback: {
    "structures-outlive-reasons": "Custom secondary feedback.",
  },
  insightXp: { dominant: 25, secondary: 15, distractor: 5 },
};

const titles = {
  "exceptions-are-forever": "Exceptions are Forever",
  "structures-outlive-reasons": "Structures Outlive Reasons",
  "learning-collapses": "Learning Collapses",
  "dissent-is-welcomed": "Dissent is Welcomed",
  "feedback-drives-change": "Feedback Drives Change",
};

describe("pattern recognition scoring", () => {
  it("classifies dominant, secondary, and distractor outcomes", () => {
    expect(classifyChoice(challenge, "exceptions-are-forever")).toBe("dominant");
    expect(classifyChoice(challenge, "structures-outlive-reasons")).toBe("secondary");
    expect(classifyChoice(challenge, "dissent-is-welcomed")).toBe("distractor");
  });

  it("awards configured Insight XP with defaults", () => {
    expect(xpForOutcome(challenge, "dominant")).toBe(25);
    expect(xpForOutcome({ ...challenge, insightXp: undefined }, "secondary")).toBe(
      DEFAULT_INSIGHT_XP.secondary,
    );
  });

  it("builds four deterministic choices preferring secondaries over distractors", () => {
    const choices = buildChoices(challenge, titles);
    expect(choices).toHaveLength(4);
    expect(choices.some((c) => c.patternId === "exceptions-are-forever")).toBe(true);
    expect(choices.some((c) => c.patternId === "structures-outlive-reasons")).toBe(true);
    expect(choices.some((c) => c.patternId === "learning-collapses")).toBe(true);
    // Only one distractor slot remains after both secondaries are included.
    const distractors = choices.filter((c) => c.role === "distractor");
    expect(distractors).toHaveLength(1);
    expect(buildChoices(challenge, titles).map((c) => c.patternId)).toEqual(
      choices.map((c) => c.patternId),
    );
  });

  it("uses soft feedback for secondary choices", () => {
    const feedback = buildFeedback({
      challenge,
      selectedPatternId: "structures-outlive-reasons",
      titleByPatternId: titles,
    });
    expect(feedback.outcome).toBe("secondary");
    expect(feedback.headline.toLowerCase()).not.toContain("wrong");
    expect(feedback.body).toContain("Custom secondary feedback");
    expect(feedback.xpAwarded).toBe(15);
  });

  it("affirms dominant choices without harsh language", () => {
    const feedback = buildFeedback({
      challenge,
      selectedPatternId: "exceptions-are-forever",
      titleByPatternId: titles,
    });
    expect(feedback.headline).toBe("Nice observation.");
    expect(feedback.body).toContain("Exceptions are Forever");
  });
});

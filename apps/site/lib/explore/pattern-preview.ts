import type { Pattern } from "@/types/semanticGraph";

/** Index / accordion eyebrow — matches Patterns mobile mockup capitalization. */
export function patternIndexEyebrow(pattern: Pattern): string {
  if (pattern.patternRole === "master") return "Master pattern";
  if (pattern.patternRole === "supporting") {
    if (pattern.realityDynamic === "obscuring") return "Supporting · Obscuring";
    if (pattern.realityDynamic === "corrective") return "Supporting · Corrective";
    return "Supporting";
  }
  return "Pattern";
}

export type PatternPreviewFields = {
  /** Short description for collapsed-row expand panels. */
  description: string | null;
  secondaryLabel: string | null;
  secondary: string | null;
};

function firstSentences(text: string | undefined, maxSentences = 2, maxChars = 220): string | null {
  const trimmed = text?.trim();
  if (!trimmed) return null;

  const parts = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!parts || parts.length === 0) {
    return trimmed.length > maxChars ? `${trimmed.slice(0, maxChars - 1).trimEnd()}…` : trimmed;
  }

  let out = "";
  for (let i = 0; i < Math.min(maxSentences, parts.length); i += 1) {
    const next = `${out}${parts[i]!.trim()} `;
    if (next.trim().length > maxChars && out) break;
    out = next;
  }
  const result = out.trim();
  if (result.length > maxChars) {
    return `${result.slice(0, maxChars - 1).trimEnd()}…`;
  }
  return result;
}

/**
 * Concise fields for Patterns index accordion previews.
 * Prefers structured narrative fields over the composed multi-block `summary`.
 */
export function patternPreviewFields(pattern: Pattern): PatternPreviewFields {
  const fromObservation = firstSentences(pattern.observation, 2);
  const fromProblem = firstSentences(pattern.problem, 2);
  const fromSummary = firstSentences(pattern.summary, 2);
  const description = fromObservation ?? fromProblem ?? fromSummary;

  let secondaryLabel: string | null = null;
  let secondary: string | null = null;

  if (pattern.problem?.trim() && fromObservation) {
    secondaryLabel = "Why it matters";
    secondary = firstSentences(pattern.problem, 1, 160);
  } else if (pattern.recognitionSignals?.[0]?.trim()) {
    secondaryLabel = "Warning signs";
    secondary = firstSentences(pattern.recognitionSignals[0], 1, 160);
  } else if (pattern.counterbalances?.[0]?.trim()) {
    secondaryLabel = "Counterbalance";
    secondary = firstSentences(pattern.counterbalances[0], 1, 160);
  } else if (pattern.forces?.[0]?.trim() && description !== fromProblem) {
    secondaryLabel = "Force";
    secondary = firstSentences(pattern.forces[0], 1, 160);
  }

  return { description, secondaryLabel, secondary };
}

import type { PatternGlanceSlot } from "@/components/icons/semantic";
import { firstSentences } from "@/lib/explore/pattern-preview";
import type { Pattern } from "@/types/semanticGraph";

export type PatternGlanceItem = {
  slot: PatternGlanceSlot;
  label: string;
  text: string;
};

const SLOT_LABELS: Record<PatternGlanceSlot, string> = {
  whatItDoes: "What it does",
  whyItMatters: "Why it matters",
  keyRisk: "Key risk",
  counterbalance: "Counterbalance",
};

function firstNonEmpty(...candidates: Array<string | undefined>): string | null {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

/**
 * Derive At-a-glance cards from real pattern fields.
 * Omits slots with no authored source — never invent empty shells.
 */
export function patternAtAGlance(pattern: Pattern): PatternGlanceItem[] {
  const items: PatternGlanceItem[] = [];

  const whatSource =
    firstNonEmpty(pattern.observation) ??
    firstNonEmpty(pattern.setup) ??
    firstNonEmpty(pattern.summary);
  const whatText = firstSentences(whatSource ?? undefined, 2, 200);
  if (whatText) {
    items.push({ slot: "whatItDoes", label: SLOT_LABELS.whatItDoes, text: whatText });
  }

  const whyText = firstSentences(pattern.problem, 2, 200);
  if (whyText) {
    items.push({ slot: "whyItMatters", label: SLOT_LABELS.whyItMatters, text: whyText });
  }

  const riskSource = firstNonEmpty(
    pattern.recognitionSignals?.[0],
    pattern.trajectory?.failureModes?.[0],
    pattern.trajectory?.earlySignals?.[0],
  );
  const riskText = firstSentences(riskSource ?? undefined, 1, 180);
  if (riskText) {
    items.push({ slot: "keyRisk", label: SLOT_LABELS.keyRisk, text: riskText });
  }

  const counterText = firstSentences(pattern.counterbalances?.[0], 1, 180);
  if (counterText) {
    items.push({
      slot: "counterbalance",
      label: SLOT_LABELS.counterbalance,
      text: counterText,
    });
  }

  return items;
}

/** 1–2 sentence teaser for the pattern detail intro (mobile-first). */
export function patternDetailTeaser(pattern: Pattern): string | null {
  return (
    firstSentences(pattern.observation, 2, 240) ??
    firstSentences(pattern.problem, 2, 240) ??
    firstSentences(pattern.summary, 2, 240)
  );
}

/**
 * Cycle line from force order, e.g. Perception → Power → Time → Contact → Perception.
 * Derived from graph force order — not hard-coded master prose.
 */
export function patternForceCycleLine(forceTitles: readonly string[]): string | null {
  if (forceTitles.length === 0) return null;
  const closed = [...forceTitles, forceTitles[0]!];
  return closed.join(" → ");
}

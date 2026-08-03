import { firstSentences } from "@/lib/explore/pattern-preview";

/** Character budget above which intro prose uses mobile disclosure. */
export const ENTITY_INTRO_DISCLOSURE_MIN_CHARS = 280;

/**
 * Build a 1–2 sentence teaser for entity detail intros.
 * Returns null when there is no authored prose.
 */
export function entityIntroTeaser(
  text: string | undefined | null,
  maxSentences = 2,
  maxChars = 240,
): string | null {
  return firstSentences(text ?? undefined, maxSentences, maxChars);
}

/**
 * Prefer an authored short gloss when it is meaningfully shorter than the full prose;
 * otherwise fall back to a sentence teaser of the full text.
 */
export function entityIntroTeaserFromFullAndShort(
  fullText: string,
  shortText: string | undefined | null,
): string | null {
  const full = fullText.trim();
  if (!full) return null;
  const short = shortText?.trim();
  if (short && short.length < full.length && short !== full) {
    return short.length > 240 ? firstSentences(short, 2, 240) : short;
  }
  return entityIntroTeaser(full);
}

/**
 * Use progressive disclosure when full prose is long and the teaser is a true
 * abbreviation (not identical to the full text).
 */
export function shouldUseEntityIntroDisclosure(
  fullText: string,
  teaser: string | null,
): boolean {
  if (!teaser) return false;
  const full = fullText.trim();
  if (full.length < ENTITY_INTRO_DISCLOSURE_MIN_CHARS) return false;
  if (teaser.trim() === full) return false;
  return true;
}

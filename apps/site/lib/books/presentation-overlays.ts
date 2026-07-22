import type { PrimaryActionPreference } from "@/lib/books/book-overview-schema";
import { FRONT_SHELF_ENTRIES } from "@/lib/start/front-shelf";

/**
 * Site-owned CTA preference overrides (not ported to after-certainty).
 * Keyed by book slug.
 */
export const PRIMARY_ACTION_PREFERENCE_BY_SLUG: Readonly<Record<string, PrimaryActionPreference>> =
  {
    "how-serious-systems-learn": "download_pdf",
    "when-others-look-to-you-v1": "purchase",
  };

/**
 * Site-owned fiction-doorway flags for trail path stops (not yet in corpus YAML).
 * Keyed by `${trailSlug}:${position}`.
 */
export const FICTION_DOORWAY_STOPS: Readonly<Record<string, true>> = {
  "judgment-before-certainty:6": true,
};

/** Site-owned shelf preview limits (presentation). Keyed by shelf slug. */
export const SHELF_MAX_PREVIEW_BY_SLUG: Readonly<Record<string, number>> = {
  "start-here": FRONT_SHELF_ENTRIES.length,
  "core-after-certainty": 4,
  "trust-and-difference": 4,
  "leadership-and-authority": 4,
  "systems-and-organizations": 4,
  fiction: 4,
  "practical-handbooks": 4,
  upcoming: 6,
  "complete-catalog": 999,
};

export function primaryActionPreferenceForSlug(slug: string): PrimaryActionPreference | undefined {
  return PRIMARY_ACTION_PREFERENCE_BY_SLUG[slug];
}

export function isFictionDoorwayStop(trailSlug: string, position: number): boolean {
  return Boolean(FICTION_DOORWAY_STOPS[`${trailSlug}:${position}`]);
}

export function shelfMaxPreview(slug: string, fallback = 4): number {
  return SHELF_MAX_PREVIEW_BY_SLUG[slug] ?? fallback;
}

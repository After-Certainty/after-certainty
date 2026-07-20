import type { BookStatus } from "@/types/content";
import type { SearchEntityType } from "@/lib/search/types";

/** Base type weights — see docs/roadmaps/global-search-plan.md §10.2. */
export const SEARCH_TYPE_BASE_BOOST: Record<SearchEntityType, number> = {
  book: 1.3,
  concept: 1.2,
  pattern: 1.1,
  situation: 1.15,
  thinker: 1.0,
  podcast_episode: 0.9,
  source: 0.85,
};

const STATUS_MULTIPLIER: Record<BookStatus, number> = {
  published: 1.0,
  forthcoming: 0.85,
  collaborative: 0.75,
  draft: 0.7,
  in_progress: 0.7,
};

export type SearchBoostInput = {
  entityType: SearchEntityType;
  status?: BookStatus;
  /** Preferred edition among siblings (books). */
  isCanonicalEdition?: boolean;
  /** Has at least one sibling edition sharing a base slug. */
  hasEditionSiblings?: boolean;
};

/**
 * Compute a static boost weight for a search document.
 * Query-time title/alias matches layer on top in Phase B ranking.
 */
export function computeSearchBoostWeight(input: SearchBoostInput): number {
  let weight = SEARCH_TYPE_BASE_BOOST[input.entityType];

  if (input.status) {
    weight *= STATUS_MULTIPLIER[input.status] ?? 0.8;
  }

  if (input.hasEditionSiblings) {
    weight *= input.isCanonicalEdition ? 1.08 : 0.9;
  }

  // Keep a stable, readable precision for fixtures and debugging.
  return Math.round(weight * 1000) / 1000;
}

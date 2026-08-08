import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";
import type { DelightVariantId } from "@/lib/games/pattern-recognition/delight";

export const PATTERN_RECOGNITION_GAME_ID = "pattern_recognition";

export type GameMode = "daily" | "practice" | "single";

export type RelatedContentType =
  | "pattern"
  | "book"
  | "chapter"
  | "situation"
  | "podcast";

/** Compact bucket for analytics — never send free text. */
export function countBucket(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return "0";
  if (count <= 5) return String(Math.round(count));
  return "6_plus";
}

export function trackGameStarted(input: { mode: GameMode }): void {
  trackEvent(AnalyticsEvents.gameStarted, {
    game_id: PATTERN_RECOGNITION_GAME_ID,
    mode: input.mode,
  });
}

export function trackChallengeAnswered(input: {
  challengeId: string;
  outcome: "dominant" | "secondary" | "distractor";
  mode: GameMode;
}): void {
  trackEvent(AnalyticsEvents.challengeAnswered, {
    challenge_id: input.challengeId,
    outcome: input.outcome,
    mode: input.mode,
  });
}

export function trackChallengeCompleted(input: {
  challengeId: string;
  outcome: "dominant" | "secondary" | "distractor";
}): void {
  trackEvent(AnalyticsEvents.challengeCompleted, {
    challenge_id: input.challengeId,
    outcome: input.outcome,
  });
}

export function trackRelatedContentOpened(input: {
  challengeId: string;
  contentType: RelatedContentType;
  itemId: string;
}): void {
  trackEvent(AnalyticsEvents.relatedContentOpened, {
    challenge_id: input.challengeId,
    content_type: input.contentType,
    item_id: input.itemId,
  });
}

export function trackSessionCompleted(input: {
  mode: Exclude<GameMode, "single">;
  questionCount: number;
  dominantCount: number;
}): void {
  trackEvent(AnalyticsEvents.sessionCompleted, {
    mode: input.mode,
    question_count_bucket: countBucket(input.questionCount),
    dominant_count_bucket: countBucket(input.dominantCount),
  });
}

/** Optional cosmetic event — IDs only, never pattern titles. */
export function trackSessionDelightShown(input: {
  variantId: DelightVariantId;
  mode: Exclude<GameMode, "single">;
}): void {
  trackEvent(AnalyticsEvents.sessionDelightShown, {
    game_id: PATTERN_RECOGNITION_GAME_ID,
    variant_id: input.variantId,
    mode: input.mode,
  });
}

export function relatedContentAnalytics(
  challengeId: string,
  contentType: RelatedContentType,
  itemId: string,
) {
  return {
    event: AnalyticsEvents.relatedContentOpened,
    params: {
      challenge_id: challengeId,
      content_type: contentType,
      item_id: itemId,
    },
  } as const;
}

/** Last path segment for analytics item_id (never titles/prose). */
export function itemIdFromPath(href: string): string {
  const trimmed = href.trim().replace(/\/+$/, "");
  const segment = trimmed.split("/").filter(Boolean).pop();
  return segment && segment.length > 0 ? segment : trimmed;
}

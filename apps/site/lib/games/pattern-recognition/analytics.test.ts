import { describe, expect, it, vi } from "vitest";

import { trackEvent } from "@/lib/analytics/track";

vi.mock("@/lib/analytics/track", () => ({
  trackEvent: vi.fn(),
}));

import {
  PATTERN_RECOGNITION_GAME_ID,
  countBucket,
  trackChallengeAnswered,
  trackGameStarted,
  trackRelatedContentOpened,
  trackSessionCompleted,
  trackSessionDelightShown,
} from "./analytics";

describe("pattern recognition analytics", () => {
  it("buckets counts without free text", () => {
    expect(countBucket(0)).toBe("0");
    expect(countBucket(5)).toBe("5");
    expect(countBucket(12)).toBe("6_plus");
  });

  it("emits ID-only game events via legacy trackEvent (no-op sink after Gate 4)", () => {
    vi.mocked(trackEvent).mockClear();
    trackGameStarted({ mode: "daily" });
    trackChallengeAnswered({
      challengeId: "challenge-demo",
      outcome: "secondary",
      mode: "daily",
    });
    trackRelatedContentOpened({
      challengeId: "challenge-demo",
      contentType: "pattern",
      itemId: "exceptions-are-forever",
    });
    trackSessionCompleted({ mode: "daily", questionCount: 5, dominantCount: 2 });
    trackSessionDelightShown({ variantId: "pattern-constellation", mode: "daily" });

    expect(trackEvent).toHaveBeenCalledWith("game_started", {
      game_id: PATTERN_RECOGNITION_GAME_ID,
      mode: "daily",
    });
    expect(trackEvent).toHaveBeenCalledWith("challenge_answered", {
      challenge_id: "challenge-demo",
      outcome: "secondary",
      mode: "daily",
    });
    expect(trackEvent).toHaveBeenCalledWith("related_content_opened", {
      challenge_id: "challenge-demo",
      content_type: "pattern",
      item_id: "exceptions-are-forever",
    });
    expect(trackEvent).toHaveBeenCalledWith("session_completed", {
      mode: "daily",
      question_count_bucket: "5",
      dominant_count_bucket: "2",
    });
    expect(trackEvent).toHaveBeenCalledWith("session_delight_shown", {
      game_id: PATTERN_RECOGNITION_GAME_ID,
      variant_id: "pattern-constellation",
      mode: "daily",
    });

    const payloads = vi.mocked(trackEvent).mock.calls.map((call) => call[1] as Record<string, unknown>);
    for (const payload of payloads) {
      expect(JSON.stringify(payload)).not.toMatch(/scenario|feedback|title/i);
    }
  });
});

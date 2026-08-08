import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CONSENT_COOKIE_NAME } from "@/lib/consent/constants";
import { setConsent } from "@/lib/consent/storage";

vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: vi.fn(),
}));

import { sendGAEvent } from "@next/third-parties/google";

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
  const env = process.env;

  beforeEach(() => {
    vi.mocked(sendGAEvent).mockClear();
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
    process.env = { ...env, NODE_ENV: "production", VERCEL_ENV: "production" };
    setConsent("granted");
  });

  afterEach(() => {
    process.env = env;
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
  });

  it("buckets counts without free text", () => {
    expect(countBucket(0)).toBe("0");
    expect(countBucket(5)).toBe("5");
    expect(countBucket(12)).toBe("6_plus");
  });

  it("emits ID-only game events", () => {
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

    expect(sendGAEvent).toHaveBeenCalledWith("event", "game_started", {
      game_id: PATTERN_RECOGNITION_GAME_ID,
      mode: "daily",
    });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "challenge_answered", {
      challenge_id: "challenge-demo",
      outcome: "secondary",
      mode: "daily",
    });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "related_content_opened", {
      challenge_id: "challenge-demo",
      content_type: "pattern",
      item_id: "exceptions-are-forever",
    });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "session_completed", {
      mode: "daily",
      question_count_bucket: "5",
      dominant_count_bucket: "2",
    });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "session_delight_shown", {
      game_id: PATTERN_RECOGNITION_GAME_ID,
      variant_id: "pattern-constellation",
      mode: "daily",
    });

    const payloads = vi.mocked(sendGAEvent).mock.calls.map((call) => call[2] as Record<string, unknown>);
    for (const payload of payloads) {
      expect(JSON.stringify(payload)).not.toMatch(/scenario|feedback|title/i);
    }
  });
});

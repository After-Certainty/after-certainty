import { describe, expect, it } from "vitest";

import { assertFallbackFresh } from "@/lib/graph/fallback-freshness";

describe("validate:fallback CLI gate", () => {
  it("enforces fallback freshness (strict when VALIDATE_FALLBACK_STRICT=1)", () => {
    const strict = process.env.VALIDATE_FALLBACK_STRICT === "1";
    expect(() => assertFallbackFresh({ strictStale: strict })).not.toThrow();
  });
});

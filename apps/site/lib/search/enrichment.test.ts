import { describe, expect, it } from "vitest";

import { cappedEnrichmentText, SEARCH_ENRICHMENT_MAX_CHARS } from "@/lib/search/enrichment";

describe("cappedEnrichmentText", () => {
  it("returns undefined for empty input", () => {
    expect(cappedEnrichmentText(undefined)).toBeUndefined();
    expect(cappedEnrichmentText([])).toBeUndefined();
  });

  it("joins signals under the character budget", () => {
    const text = cappedEnrichmentText(["alpha signal", "beta signal"], 40);
    expect(text).toBe("alpha signal\nbeta signal");
  });

  it("stops before exceeding the budget and keeps earlier signals", () => {
    const text = cappedEnrichmentText(
      ["short one", "another short", "a much longer recognition signal that should be skipped"],
      30,
    );
    expect(text).toBe("short one\nanother short");
    expect(text!.length).toBeLessThanOrEqual(30);
  });

  it("uses the default Phase E cap", () => {
    const long = "x".repeat(SEARCH_ENRICHMENT_MAX_CHARS + 80);
    const text = cappedEnrichmentText([long]);
    expect(text?.length).toBe(SEARCH_ENRICHMENT_MAX_CHARS);
  });
});

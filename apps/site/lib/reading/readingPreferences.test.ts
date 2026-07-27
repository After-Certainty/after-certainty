import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearReadingPreferences,
  DEFAULT_READING_PREFERENCES,
  getReadingPreferences,
  READING_PREFERENCES_STORAGE_KEY,
  setReadingPreferences,
  setReadingTextSize,
} from "@/lib/reading/readingPreferences";

describe("readingPreferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("returns defaults when nothing is stored", () => {
    expect(getReadingPreferences().textSize).toBe(DEFAULT_READING_PREFERENCES.textSize);
  });

  it("persists text size", () => {
    setReadingTextSize("lg");
    expect(getReadingPreferences().textSize).toBe("lg");
    expect(window.localStorage.getItem(READING_PREFERENCES_STORAGE_KEY)).toContain("lg");
  });

  it("ignores invalid stored values and drops legacy theme fields", () => {
    window.localStorage.setItem(
      READING_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ textSize: "huge", theme: "sepia", updatedAt: "x" }),
    );
    expect(getReadingPreferences().textSize).toBe("md");
    expect(getReadingPreferences()).not.toHaveProperty("theme");
  });

  it("patches text size", () => {
    setReadingPreferences({ textSize: "xl" });
    setReadingPreferences({ textSize: "sm" });
    expect(getReadingPreferences().textSize).toBe("sm");
  });

  it("clears stored preferences", () => {
    setReadingTextSize("xl");
    clearReadingPreferences();
    expect(window.localStorage.getItem(READING_PREFERENCES_STORAGE_KEY)).toBeNull();
    expect(getReadingPreferences().textSize).toBe("md");
  });
});

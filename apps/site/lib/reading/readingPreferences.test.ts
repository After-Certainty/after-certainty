import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearReadingPreferences,
  DEFAULT_READING_PREFERENCES,
  getReadingPreferences,
  READING_PREFERENCES_STORAGE_KEY,
  setReadingLineHeight,
  setReadingPreferences,
  setReadingTextSize,
  setReadingWidth,
} from "@/lib/reading/readingPreferences";
import { readVersionedLocalState } from "@/lib/storage/safe-local-storage";

describe("readingPreferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("returns defaults when nothing is stored", () => {
    expect(getReadingPreferences().textSize).toBe(DEFAULT_READING_PREFERENCES.textSize);
    expect(getReadingPreferences().lineHeight).toBe(DEFAULT_READING_PREFERENCES.lineHeight);
    expect(getReadingPreferences().readingWidth).toBe(DEFAULT_READING_PREFERENCES.readingWidth);
  });

  it("persists text size in a versioned envelope", () => {
    setReadingTextSize("lg");
    expect(getReadingPreferences().textSize).toBe("lg");
    expect(window.localStorage.getItem(READING_PREFERENCES_STORAGE_KEY)).toContain("lg");
    expect(readVersionedLocalState(READING_PREFERENCES_STORAGE_KEY, 1)?.data).toMatchObject({
      textSize: "lg",
    });
  });

  it("migrates legacy flat prefs and drops theme fields", () => {
    window.localStorage.setItem(
      READING_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ textSize: "huge", theme: "sepia", updatedAt: "x" }),
    );
    expect(getReadingPreferences().textSize).toBe("md");
    expect(getReadingPreferences()).not.toHaveProperty("theme");
    expect(readVersionedLocalState(READING_PREFERENCES_STORAGE_KEY, 1)).not.toBeNull();
  });

  it("patches line height and width", () => {
    setReadingLineHeight("relaxed");
    setReadingWidth("wide");
    expect(getReadingPreferences().lineHeight).toBe("relaxed");
    expect(getReadingPreferences().readingWidth).toBe("wide");
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

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearReadingPreferences,
  DEFAULT_READING_PREFERENCES,
  getReadingPreferences,
  READING_PREFERENCES_STORAGE_KEY,
  setReadingPreferences,
  setReadingTextSize,
  setReadingTheme,
} from "@/lib/reading/readingPreferences";

describe("readingPreferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("returns defaults when nothing is stored", () => {
    const prefs = getReadingPreferences();
    expect(prefs.textSize).toBe(DEFAULT_READING_PREFERENCES.textSize);
    expect(prefs.theme).toBe(DEFAULT_READING_PREFERENCES.theme);
  });

  it("persists text size and theme", () => {
    setReadingTextSize("lg");
    setReadingTheme("sepia");

    const prefs = getReadingPreferences();
    expect(prefs.textSize).toBe("lg");
    expect(prefs.theme).toBe("sepia");
    expect(window.localStorage.getItem(READING_PREFERENCES_STORAGE_KEY)).toContain("sepia");
  });

  it("ignores invalid stored values", () => {
    window.localStorage.setItem(
      READING_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ textSize: "huge", theme: "neon", updatedAt: "x" }),
    );
    const prefs = getReadingPreferences();
    expect(prefs.textSize).toBe("md");
    expect(prefs.theme).toBe("inherit");
  });

  it("patches without wiping the other preference", () => {
    setReadingPreferences({ textSize: "xl", theme: "night" });
    setReadingPreferences({ textSize: "sm" });
    expect(getReadingPreferences()).toMatchObject({ textSize: "sm", theme: "night" });
  });

  it("clears stored preferences", () => {
    setReadingTheme("sepia");
    clearReadingPreferences();
    expect(window.localStorage.getItem(READING_PREFERENCES_STORAGE_KEY)).toBeNull();
    expect(getReadingPreferences().theme).toBe("inherit");
  });
});

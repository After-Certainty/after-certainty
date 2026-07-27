import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  ReadingPreferencesControls,
  ReadingPreferencesRoot,
} from "@/components/reading/reading-preferences-controls";
import {
  getReadingPreferences,
  READING_PREFERENCES_STORAGE_KEY,
} from "@/lib/reading/readingPreferences";

describe("ReadingPreferencesControls", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("applies default size data attribute without theme controls", () => {
    render(
      <ReadingPreferencesRoot aria-labelledby="t">
        <h1 id="t">Title</h1>
        <ReadingPreferencesControls />
      </ReadingPreferencesRoot>,
    );

    const root = document.querySelector(".chapter-reader");
    expect(root).toHaveAttribute("data-reading-size", "md");
    expect(root).not.toHaveAttribute("data-reading-theme");
    expect(screen.queryByRole("radiogroup", { name: "Reading theme" })).not.toBeInTheDocument();
  });

  it("changes text size and persists preference", async () => {
    const user = userEvent.setup();
    render(
      <ReadingPreferencesRoot aria-labelledby="t">
        <h1 id="t">Title</h1>
        <ReadingPreferencesControls />
      </ReadingPreferencesRoot>,
    );

    await user.click(screen.getByRole("button", { name: "Increase text size" }));
    expect(document.querySelector(".chapter-reader")).toHaveAttribute("data-reading-size", "lg");
    expect(getReadingPreferences().textSize).toBe("lg");
    expect(window.localStorage.getItem(READING_PREFERENCES_STORAGE_KEY)).toContain("lg");
  });

  it("disables decrease at the smallest size", async () => {
    const user = userEvent.setup();
    render(<ReadingPreferencesControls />);

    await user.click(screen.getByRole("button", { name: "Decrease text size" }));
    expect(screen.getByRole("button", { name: "Decrease text size" })).toBeDisabled();
    expect(getReadingPreferences().textSize).toBe("sm");
  });
});

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

  it("applies default appearance data attributes without a reader theme", () => {
    render(
      <ReadingPreferencesRoot aria-labelledby="t">
        <h1 id="t">Title</h1>
        <ReadingPreferencesControls />
      </ReadingPreferencesRoot>,
    );

    const root = document.querySelector(".chapter-reader") as HTMLElement;
    expect(root).toHaveAttribute("data-reading-size", "md");
    expect(root).toHaveAttribute("data-reading-line-height", "comfortable");
    expect(root).toHaveAttribute("data-reading-width", "medium");
    expect(root).toHaveClass("max-w-3xl");
    expect(root.style.getPropertyValue("--reader-font-size")).toBe("1.0625rem");
    expect(root.style.getPropertyValue("--reader-line-height")).toBe("1.75");
    expect(root).not.toHaveAttribute("data-reading-theme");
    expect(screen.queryByRole("radiogroup", { name: "Reading theme" })).not.toBeInTheDocument();
    expect(screen.getByText(/saved on this device only/i)).toBeInTheDocument();
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
    const root = document.querySelector(".chapter-reader") as HTMLElement;
    expect(root).toHaveAttribute("data-reading-size", "lg");
    expect(root.style.getPropertyValue("--reader-font-size")).toBe("1.25rem");
    expect(getReadingPreferences().textSize).toBe("lg");
    expect(window.localStorage.getItem(READING_PREFERENCES_STORAGE_KEY)).toContain("lg");
  });

  it("changes line spacing and reading width", async () => {
    const user = userEvent.setup();
    render(
      <ReadingPreferencesRoot aria-labelledby="t">
        <h1 id="t">Title</h1>
        <ReadingPreferencesControls />
      </ReadingPreferencesRoot>,
    );

    await user.click(screen.getByRole("button", { name: "Increase line spacing" }));
    await user.click(screen.getByRole("button", { name: "Increase reading width" }));
    const root = document.querySelector(".chapter-reader") as HTMLElement;
    expect(root).toHaveAttribute("data-reading-line-height", "relaxed");
    expect(root).toHaveAttribute("data-reading-width", "wide");
    expect(root).toHaveClass("max-w-5xl");
    expect(getReadingPreferences().lineHeight).toBe("relaxed");
    expect(getReadingPreferences().readingWidth).toBe("wide");
  });

  it("resets appearance to defaults", async () => {
    const user = userEvent.setup();
    render(
      <ReadingPreferencesRoot aria-labelledby="t">
        <h1 id="t">Title</h1>
        <ReadingPreferencesControls />
      </ReadingPreferencesRoot>,
    );

    await user.click(screen.getByRole("button", { name: "Increase text size" }));
    await user.click(screen.getByRole("button", { name: "Reset appearance" }));
    expect(getReadingPreferences().textSize).toBe("md");
    expect(window.localStorage.getItem(READING_PREFERENCES_STORAGE_KEY)).toBeNull();
  });

  it("disables decrease at the smallest size", async () => {
    const user = userEvent.setup();
    render(<ReadingPreferencesControls />);

    await user.click(screen.getByRole("button", { name: "Decrease text size" }));
    expect(screen.getByRole("button", { name: "Decrease text size" })).toBeDisabled();
    expect(getReadingPreferences().textSize).toBe("sm");
  });
});

import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

test.describe("Explore index mobile parity", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("patterns groups use mobile accordion defaults", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore/patterns");

    await expect(page.getByRole("heading", { name: "Patterns", level: 1 })).toBeVisible();

    const languageGroup = page.getByRole("button", { name: /After Certainty Pattern Language/i });
    await expect(languageGroup).toBeVisible();
    await expect(languageGroup).toHaveAttribute("aria-expanded", "true");

    const portfolioGroup = page.getByRole("button", { name: /Portfolio patterns/i });
    await expect(portfolioGroup).toBeVisible();
    await expect(portfolioGroup).toHaveAttribute("aria-expanded", "false");

    await portfolioGroup.click();
    await expect(portfolioGroup).toHaveAttribute("aria-expanded", "true");
    await expect(languageGroup).toHaveAttribute("aria-expanded", "true");

    await expect(page.getByText("View Pattern →").first()).toBeVisible();
  });

  test("concepts index shows compact catalog cards on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore/concepts");

    await expect(page.getByRole("heading", { name: "Concepts", level: 1 })).toBeVisible();
    await expect(page.getByText("View Concept →").first()).toBeVisible();
  });
});

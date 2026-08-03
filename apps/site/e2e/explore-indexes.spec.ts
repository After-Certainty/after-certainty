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
    await expect(page.locator('[data-density="editorial"]')).toBeVisible();
    await expect(page.getByText(/\d+ patterns/i).first()).toBeVisible();

    const languageGroup = page.getByRole("button", { name: /After Certainty Pattern Language/i });
    await expect(languageGroup).toBeVisible();
    await expect(languageGroup).toHaveAttribute("aria-expanded", "true");

    const portfolioGroup = page.getByRole("button", { name: /Portfolio patterns/i });
    await expect(portfolioGroup).toBeVisible();
    await expect(portfolioGroup).toHaveAttribute("aria-expanded", "false");

    await portfolioGroup.click();
    await expect(portfolioGroup).toHaveAttribute("aria-expanded", "true");
    await expect(languageGroup).toHaveAttribute("aria-expanded", "true");

    const patternRow = page.getByRole("button", { name: /Master pattern|Supporting/i }).first();
    await expect(patternRow).toBeVisible();
    await patternRow.click();
    await expect(patternRow).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /View pattern/i }).first()).toBeVisible();
  });

  test("concepts index shows compact catalog cards on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore/concepts");

    await expect(page.getByRole("heading", { name: "Concepts", level: 1 })).toBeVisible();
    await expect(page.locator('[data-density="editorial"]')).toBeVisible();
    await expect(page.getByText(/\d+ concepts?/i).first()).toBeVisible();
    await expect(page.getByText("View Concept →").first()).toBeVisible();
  });

  test("thinkers index uses editorial hero density on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore/thinkers");

    await expect(page.getByRole("heading", { name: "Thinkers", level: 1 })).toBeVisible();
    await expect(page.locator('[data-density="editorial"]')).toBeVisible();
    await expect(page.getByText(/\d+ thinkers?/i).first()).toBeVisible();
  });
});

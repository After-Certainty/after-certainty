import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";
import { smokeUrls } from "./fixtures/smoke-urls";

const mainContent = "#main";

test.describe("page smoke", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  for (const { path, label } of smokeUrls) {
    test(`${label} (${path}) loads successfully`, async ({ page }) => {
      const timeout = path === "/explore" ? 30_000 : 15_000;

      const response = await page.goto(path, { waitUntil: "domcontentloaded", timeout });
      expect(response?.status(), `Expected ${path} to return 200`).toBe(200);
      await expect(page.locator(mainContent)).toBeVisible({ timeout });

      if (path === "/explore") {
        await expect(page.locator("article")).toBeVisible({ timeout });
      }
    });
  }

  test("legacy /books/:slug redirects to /explore/books/:slug", async ({ page }) => {
    await page.goto("/books/after-certainty", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/explore\/books\/after-certainty$/);
    await expect(page.locator(mainContent)).toBeVisible();
  });

  test("legacy Search Console book URLs redirect to exact Explore targets", async ({ page }) => {
    const samples = [
      {
        from: "/books/when-authority-outlives-accountability",
        to: /\/explore\/books\/when-authority-outlives-accountability$/,
      },
      {
        from: "/books/why-collaboration-is-so-hard",
        to: /\/explore\/books\/why-collaboration-is-so-hard$/,
      },
      {
        from: "/books/when-others-look-to-you/patterns/exceptions-are-forever",
        to: /\/explore\/patterns\/exceptions-are-forever$/,
      },
    ];
    for (const { from, to } of samples) {
      await page.goto(from, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(to);
      await expect(page).not.toHaveURL(/\/$/);
    }
  });

  test("priority concept pages SSR definition without client interaction", async ({ page }) => {
    const response = await page.goto("/explore/concepts/shift-left", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);
    const html = await page.content();
    expect(html).toMatch(/<h1[^>]*>[\s\S]*Shift Left/i);
    expect(html.toLowerCase()).toContain("canonical");
  });
});

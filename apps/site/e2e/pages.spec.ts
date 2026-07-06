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
});

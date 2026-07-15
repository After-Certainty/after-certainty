import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

const mainContent = "#main";

test.describe("thinkers and book influences", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("after-certainty book page splits thinkers from research sources", async ({ page }) => {
    await page.goto("/explore/books/after-certainty", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Major thinkers" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Research sources" })).toBeVisible();

    const thinkerLink = page.locator('a[href="/explore/thinkers/john-dewey"]').first();
    await expect(thinkerLink).toBeVisible();
    await expect(thinkerLink).toContainText("John Dewey");

    const sourceLink = page
      .locator(
        'a[href="/explore/sources/dewey-john-the-quest-for-certainty-a-study-of-the-relation-of"]',
      )
      .first();
    await expect(sourceLink).toBeVisible();
  });

  test("thinker index links to detail pages that load successfully", async ({ page }) => {
    await page.goto("/explore/thinkers?q=dewey", { waitUntil: "domcontentloaded" });
    await expect(page.locator(mainContent)).toBeVisible();

    const johnDeweyLink = page.locator('a[href="/explore/thinkers/john-dewey"]').first();
    await expect(johnDeweyLink).toBeVisible();

    const response = await page.goto("/explore/thinkers/john-dewey", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status(), "Thinker detail should return 200").toBe(200);

    await expect(page.getByRole("heading", { level: 1, name: "John Dewey" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Works" })).toBeVisible();
  });
});

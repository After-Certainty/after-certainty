import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

const introPath = "/explore/books/after-certainty/chapters/front-matter-introduction";
const nextPath = "/explore/books/after-certainty/chapters/parts-part-1-letting-go-bridge";

test.describe("reader smoke (READ-009)", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("open chapter → next → back to book overview", async ({ page }) => {
    const response = await page.goto(introPath, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    expect(response?.status()).toBe(200);

    await expect(page.locator("#chapter-title")).toBeVisible();
    await expect(page.locator(".chapter-manuscript")).toBeVisible();

    const next = page
      .getByRole("navigation", { name: "Previous and next chapter", exact: true })
      .getByRole("link", { name: /Next chapter:/i });
    await expect(next).toBeVisible();
    await next.click();
    await expect(page).toHaveURL(new RegExp(`${nextPath.replace(/\//g, "\\/")}$`));
    await expect(page.locator("#chapter-title")).toBeVisible();

    await page.getByRole("link", { name: "Back to book" }).click();
    await expect(page).toHaveURL(/\/explore\/books\/after-certainty$/);
    await expect(page.getByRole("heading", { name: "After Certainty", level: 1 })).toBeVisible();
  });

  test("manuscript Contents links open chapter routes", async ({ page }) => {
    await page.goto(
      "/explore/books/the-economy-we-dont-experience/chapters/front-matter-contents",
      { waitUntil: "domcontentloaded", timeout: 30_000 },
    );
    const intro = page
      .locator(".chapter-manuscript")
      .getByRole("link", { name: "Introduction — The Chart and the Receipt" });
    await expect(intro).toBeVisible();
    await expect(intro).toHaveAttribute(
      "href",
      "/explore/books/the-economy-we-dont-experience/chapters/front-matter-introduction-the-chart-and-the-receipt",
    );
    await intro.click();
    await expect(page).toHaveURL(
      /\/explore\/books\/the-economy-we-dont-experience\/chapters\/front-matter-introduction-the-chart-and-the-receipt$/,
    );
    await expect(page.locator("#chapter-title")).toBeVisible();
  });
});

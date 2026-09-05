import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

/**
 * Mobile stability for /listen: exactly one Suno iframe for the persistent player,
 * regardless of scroll position or library length.
 */
test.describe("Listen mobile persistent player", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("keeps exactly one Suno iframe while scrolling @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/listen", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Songs from After Certainty" })).toBeVisible();
    await expect(page.locator("[data-listen-player]")).toBeVisible();

    const iframe = page.locator('iframe[title$="— Suno player"]');
    await expect(iframe).toHaveCount(1);

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewHeight = await page.evaluate(() => window.innerHeight);

    await page.evaluate((y) => window.scrollTo(0, y), Math.floor(scrollHeight * 0.35));
    await page.waitForTimeout(300);
    await expect(iframe).toHaveCount(1);

    await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, scrollHeight - viewHeight - 40));
    await page.waitForTimeout(300);
    await expect(iframe).toHaveCount(1);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await expect(iframe).toHaveCount(1);
  });

  test("selecting a song updates the single iframe src @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/listen", { waitUntil: "domcontentloaded" });

    const iframe = page.locator('iframe[title$="— Suno player"]');
    await expect(iframe).toHaveCount(1);
    const initialSrc = await iframe.first().getAttribute("src");

    const next = page.getByRole("button", { name: "Next song" });
    await expect(next).toBeEnabled();
    await next.click();

    await expect(iframe).toHaveCount(1);
    await expect.poll(async () => iframe.first().getAttribute("src")).not.toBe(initialSrc);
  });

  test("sticky player stays below header and does not cover footer nav @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/listen", { waitUntil: "domcontentloaded" });

    const player = page.locator("[data-listen-player]");
    await expect(player).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(250);

    const playerBox = await player.boundingBox();
    const header = page.locator("header").first();
    const headerBox = await header.boundingBox();
    expect(playerBox).toBeTruthy();
    expect(headerBox).toBeTruthy();
    if (playerBox && headerBox) {
      expect(playerBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 2);
      expect(playerBox.y).toBeLessThan(200);
    }

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(250);

    const footerNav = page.locator('[data-footer-nav="mobile"]');
    await expect(footerNav).toBeVisible();
    const footerBox = await footerNav.boundingBox();
    const playerAtBottom = await player.boundingBox();
    expect(footerBox).toBeTruthy();
    if (playerAtBottom && footerBox && playerAtBottom.y + playerAtBottom.height > footerBox.y) {
      const footerCenterY = footerBox.y + footerBox.height / 2;
      expect(playerAtBottom.y + playerAtBottom.height).toBeLessThan(footerCenterY);
    }
  });
});

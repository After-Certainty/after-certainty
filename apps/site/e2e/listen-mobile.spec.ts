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

    const playButtons = page.getByRole("button", { name: /^Play / });
    await expect(playButtons.first()).toBeVisible();
    const count = await playButtons.count();
    if (count > 1) {
      await playButtons.nth(1).click();
    } else {
      await page.getByRole("button", { name: "Next song" }).click();
    }

    await expect(iframe).toHaveCount(1);
    const nextSrc = await iframe.first().getAttribute("src");
    expect(nextSrc).toBeTruthy();
    expect(nextSrc).not.toBe(initialSrc);
  });

  test("sticky player stays below header and does not cover footer nav @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/listen", { waitUntil: "domcontentloaded" });

    const player = page.locator("[data-listen-player]");
    await expect(player).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(200);

    const playerBox = await player.boundingBox();
    const header = page.locator("header").first();
    const headerBox = await header.boundingBox();
    expect(playerBox).toBeTruthy();
    expect(headerBox).toBeTruthy();
    if (playerBox && headerBox) {
      expect(playerBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 2);
    }

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(200);

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

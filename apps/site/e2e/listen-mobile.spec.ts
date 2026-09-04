import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

/**
 * Mobile stability for /listen: Suno iframes must mount near the viewport and
 * unmount when far away so Safari does not accumulate ~32 live embeds.
 */
test.describe("Listen mobile iframe lifecycle", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("keeps mounted Suno iframes bounded while scrolling @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/listen", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Songs from After Certainty" })).toBeVisible();

    // Before meaningful scroll, deferred mounts should keep iframe count low.
    await page.waitForTimeout(300);
    const initialIframes = await page.locator('iframe[title$="— Suno player"]').count();
    expect(initialIframes).toBeLessThan(10);

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewHeight = await page.evaluate(() => window.innerHeight);

    // Mid-page: some players mount, but far ones remain deferred.
    await page.evaluate((y) => window.scrollTo(0, y), Math.floor(scrollHeight * 0.35));
    await page.waitForTimeout(500);
    const midIframes = await page.locator('iframe[title$="— Suno player"]').count();
    expect(midIframes).toBeLessThan(10);
    expect(midIframes).toBeGreaterThan(0);

    // Near bottom: still bounded — must not equal all 32 songs.
    await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, scrollHeight - viewHeight - 40));
    await page.waitForTimeout(500);
    const bottomIframes = await page.locator('iframe[title$="— Suno player"]').count();
    expect(bottomIframes).toBeLessThan(10);

    const deferredPlaceholders = await page.locator('[data-suno-embed="deferred"]').count();
    expect(deferredPlaceholders).toBeGreaterThan(0);

    // Scroll back toward the top: previously far cards can remount; still bounded.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const topIframes = await page.locator('iframe[title$="— Suno player"]').count();
    expect(topIframes).toBeLessThan(10);
  });

  test("manual Load player mounts an iframe @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/listen", { waitUntil: "domcontentloaded" });

    // Jump past the first few so the near band may not auto-mount everything we click.
    await page.evaluate(() => window.scrollTo(0, 0));

    const loadButtons = page.getByRole("button", { name: /load player/i });
    // Prefer a deferred card if any remain; otherwise the first button.
    const deferred = page.locator('[data-suno-embed="deferred"]');
    if ((await deferred.count()) > 0) {
      await deferred.first().getByRole("button", { name: /load player/i }).click();
    } else {
      await loadButtons.first().click();
    }

    await expect(page.locator('iframe[title$="— Suno player"]').first()).toBeVisible();
  });
});

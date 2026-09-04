import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

test.describe("homepage mobile redesign", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  for (const width of [320, 375, 390, 430] as const) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth + 1;
      });
      expect(overflow).toBe(false);
    });
  }

  test("surfaces compact questions, pattern recognition, and invitation links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "What question brought you here?" }),
    ).toBeVisible();
    await expect(page.locator("[data-question-density='compact']").first()).toBeVisible();

    await expect(page.getByText("Why this project exists")).toBeVisible();
    await expect(page.getByRole("link", { name: /Read more about the idea/i })).toHaveAttribute(
      "href",
      "/about",
    );

    await expect(
      page.getByRole("heading", { name: /Can you recognize the pattern/i }),
    ).toBeVisible();
    await expect(page.getByTestId("home-pattern-recognition-cta")).toHaveAttribute(
      "href",
      "/games/pattern-recognition",
    );

    const invitations = page.getByRole("region", { name: /Where to begin/i });
    await expect(invitations.getByRole("link", { name: /^Start Here/i })).toHaveAttribute(
      "href",
      "/start",
    );
    await expect(invitations.getByRole("link", { name: /^Books/i })).toBeVisible();
    await expect(invitations.getByRole("link", { name: /^Podcast/i })).toHaveAttribute(
      "href",
      "/podcast",
    );
    await expect(invitations.getByRole("link", { name: /^About/i })).toHaveAttribute(
      "href",
      "/about",
    );

    await expect(page.getByRole("link", { name: /Find your way in/i })).toHaveAttribute(
      "href",
      "/start",
    );

    await expect(page.getByRole("heading", { name: "Follow a reading trail" })).toHaveCount(0);

    await expect(page.getByTestId("home-pattern-recognition-cta")).toBeVisible();
    await page.getByTestId("home-pattern-recognition-cta").click();
    await expect(page).toHaveURL(/\/games\/pattern-recognition/);
  });

  test("header search is icon-labeled on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const search = page.getByRole("banner").getByRole("button", { name: /^Search$/i });
    await expect(search).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: /^Start$/i })).toBeHidden();
  });
});

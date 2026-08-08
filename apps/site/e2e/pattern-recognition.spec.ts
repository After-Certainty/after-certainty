import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

const lobbyPath = "/games/pattern-recognition";
const challengePath = "/games/pattern-recognition/challenge/hallway-workaround-exception";

test.describe("Pattern Recognition Challenge", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("single challenge: answer → soft feedback → related pattern → exit", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const response = await page.goto(challengePath, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { name: "What pattern do you see?" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Pattern choices" })).toBeVisible();
    await expect(page.getByRole("banner")).toHaveCount(0);

    const secondaryChoice = page
      .getByRole("group", { name: "Pattern choices" })
      .getByRole("button", { name: /Structures Outlive Reasons/i });
    await secondaryChoice.click();

    const feedback = page.getByTestId("challenge-feedback");
    await expect(feedback).toBeVisible();
    await expect(feedback).toHaveAttribute("aria-live", "polite");
    await expect(page.getByTestId("challenge-xp-award")).toBeVisible();
    await expect(page.getByTestId("read-the-pattern")).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/explore\/patterns\/exceptions-are-forever\/?$/, { timeout: 30_000 }),
      page.getByTestId("read-the-pattern").click(),
    ]);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goto(challengePath, { waitUntil: "domcontentloaded" });
    await page.getByRole("group", { name: "Pattern choices" }).getByRole("button").first().click();
    await expect(page.getByTestId("challenge-feedback")).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/games\/pattern-recognition\/?$/, { timeout: 30_000 }),
      page.getByTestId("exit-challenge").click(),
    ]);
    await expect(page.getByRole("heading", { name: "Pattern Recognition Challenge" })).toBeVisible();
  });

  test("daily session completes five questions", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(lobbyPath, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await expect(page.getByTestId("start-daily")).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/games\/pattern-recognition\/daily\/?$/, { timeout: 30_000 }),
      page.getByTestId("start-daily").click(),
    ]);

    await expect(page.getByTestId("question-progress")).toHaveText("Question 1 of 5");
    await expect(page.getByRole("banner")).toHaveCount(0);

    for (let question = 1; question <= 5; question += 1) {
      await expect(page.getByTestId("question-progress")).toHaveText(
        `Question ${question} of 5`,
      );
      await page.getByRole("group", { name: "Pattern choices" }).getByRole("button").first().click();
      await expect(page.getByTestId("challenge-feedback")).toBeVisible();
      await page.getByTestId("continue-session").click();
    }

    await expect(page.getByRole("heading", { name: "Five recognitions logged." })).toBeVisible();
    const delight = page.getByTestId("session-complete-delight");
    await expect(delight).toBeVisible();
    await expect(delight).toHaveAttribute("aria-hidden", "true");
    await expect(delight).toHaveAttribute("data-variant", "pattern-constellation");
    // Results CTAs must stay usable while the decorative wink plays.
    await Promise.all([
      page.waitForURL(/\/games\/pattern-recognition\/?$/, { timeout: 30_000 }),
      page.getByRole("link", { name: "Back to lobby" }).click(),
    ]);
    await expect(page.getByTestId("daily-completed-note")).toBeVisible();
    await expect(page.getByTestId("lobby-streak")).toContainText("1 day");
  });

  test("daily results with reduced motion stay immediately usable", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(lobbyPath, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await Promise.all([
      page.waitForURL(/\/games\/pattern-recognition\/daily\/?$/, { timeout: 30_000 }),
      page.getByTestId("start-daily").click(),
    ]);

    for (let question = 1; question <= 5; question += 1) {
      await page.getByRole("group", { name: "Pattern choices" }).getByRole("button").first().click();
      await expect(page.getByTestId("challenge-feedback")).toBeVisible();
      await page.getByTestId("continue-session").click();
    }

    await expect(page.getByRole("heading", { name: "Five recognitions logged." })).toBeVisible();
    const delight = page.getByTestId("session-complete-delight");
    await expect(delight).toHaveAttribute("data-reduced-motion", "true");
    await expect(page.getByRole("link", { name: "Back to lobby" })).toBeEnabled();
    await Promise.all([
      page.waitForURL(/\/games\/pattern-recognition\/?$/, { timeout: 30_000 }),
      page.getByRole("link", { name: "Back to lobby" }).click(),
    ]);
  });

  test("play shell exposes live feedback region without site chrome", async ({ page }) => {
    await page.goto(challengePath, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    await expect(page.getByLabel("Exit challenge")).toBeVisible();

    await page.getByRole("group", { name: "Pattern choices" }).getByRole("button").first().click();
    const feedback = page.getByTestId("challenge-feedback");
    await expect(feedback).toBeVisible();
    await expect(feedback).toHaveAttribute("role", "status");
    await expect(feedback).toHaveAttribute("tabindex", "-1");
  });
});

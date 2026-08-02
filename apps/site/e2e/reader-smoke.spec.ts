import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

const introPath = "/explore/books/after-certainty/chapters/front-matter-introduction";
const nextPath = "/explore/books/after-certainty/chapters/parts-part-1-letting-go-bridge";

/** Chapter chrome title — wait until soft-nav overlap has resolved to a single h1. */
async function expectUniqueChapterTitle(page: import("@playwright/test").Page) {
  const title = page.locator("article[data-chapter-reader] #chapter-title");
  await expect(title).toHaveCount(1, { timeout: 15_000 });
  await expect(title).toBeVisible();
  return title;
}

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

    await expectUniqueChapterTitle(page);
    await expect(page.locator("#chapter-content .chapter-manuscript")).toBeVisible();
    await expect(page.getByTestId("reading-progress-chrome")).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Chapter scroll progress" })).toBeVisible();
    await expect(page.getByTestId("reader-exit")).toBeVisible();

    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByTestId("reader-controls-open")).toBeVisible();

    const next = page
      .getByRole("navigation", { name: "Previous and next chapter" })
      .getByRole("link", { name: /Next chapter:/i });
    await expect(next).toBeVisible();
    await Promise.all([
      page.waitForURL(new RegExp(`${nextPath.replace(/\//g, "\\/")}$`), { timeout: 30_000 }),
      next.click(),
    ]);
    await expectUniqueChapterTitle(page);

    await Promise.all([
      page.waitForURL(/\/explore\/books\/after-certainty$/, { timeout: 30_000 }),
      page.getByTestId("reader-exit").click(),
    ]);
    await expect(page.getByRole("heading", { name: "After Certainty", level: 1 })).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("manuscript Contents links open chapter routes", async ({ page }) => {
    await page.goto(
      "/explore/books/the-economy-we-dont-experience/chapters/front-matter-contents",
      { waitUntil: "domcontentloaded", timeout: 30_000 },
    );
    const intro = page
      .locator("#chapter-content .chapter-manuscript")
      .getByRole("link", { name: "Introduction — The Chart and the Receipt" });
    await expect(intro).toBeVisible();
    await expect(intro).toHaveAttribute(
      "href",
      "/explore/books/the-economy-we-dont-experience/chapters/front-matter-introduction-the-chart-and-the-receipt",
    );
    await Promise.all([
      page.waitForURL(
        /\/explore\/books\/the-economy-we-dont-experience\/chapters\/front-matter-introduction-the-chart-and-the-receipt$/,
        { timeout: 30_000 },
      ),
      intro.click(),
    ]);
    await expectUniqueChapterTitle(page);
  });
});

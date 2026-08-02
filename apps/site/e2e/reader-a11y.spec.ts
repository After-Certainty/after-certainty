import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

const chapterPath = "/explore/books/after-certainty/chapters/front-matter-introduction";

test.describe("reader accessibility baseline (READ-008)", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("chapter page exposes landmarks, skip target, and labelled article", async ({ page }) => {
    const response = await page.goto(chapterPath, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    expect(response?.status()).toBe(200);

    await expect(page.locator("#main")).toBeVisible();
    // Dedicated reader shell — no standard site header/footer.
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);

    const article = page.getByRole("article");
    await expect(article).toBeVisible();

    const title = page.locator("#chapter-title");
    await expect(title).toBeVisible();
    await expect(title).toHaveAttribute("id", "chapter-title");

    const labelledBy = await article.getAttribute("aria-labelledby");
    expect(labelledBy).toBe("chapter-title");

    await expect(
      page.getByRole("navigation", { name: "Previous and next chapter", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Chapter scroll progress" })).toBeVisible();
    await expect(page.getByTestId("reader-exit")).toBeVisible();

    await page.getByTestId("reader-controls-open").click();
    await expect(page.getByTestId("reader-controls-drawer")).toBeVisible();
    await page.getByTestId("reader-tab-contents").click();
    await expect(page.getByRole("navigation", { name: "Table of contents" })).toBeVisible();

    const content = page.locator("#chapter-content");
    await expect(content).toBeVisible();
    await expect(content).toHaveAttribute("tabindex", "-1");
  });

  test("in-reader skip link moves focus to chapter content", async ({ page }) => {
    await page.goto(chapterPath, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const skip = page.getByRole("link", { name: "Skip to chapter text" });
    await skip.focus();
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.locator("#chapter-content")).toBeFocused();
  });

  test("footnote refs and backrefs resolve to existing ids", async ({ page }) => {
    await page.goto(chapterPath, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const manuscript = page.locator(".chapter-manuscript");
    await expect(manuscript).toBeVisible();

    const refs = manuscript.locator("a[data-footnote-ref]");
    const refCount = await refs.count();
    expect(refCount).toBeGreaterThan(0);

    const firstRef = refs.first();
    const href = await firstRef.getAttribute("href");
    expect(href?.startsWith("#")).toBe(true);
    const noteId = href!.slice(1);
    await expect(page.locator(`[id="${noteId}"]`)).toHaveCount(1);

    await firstRef.click();
    await expect(page.locator(`[id="${noteId}"]`)).toBeVisible();

    const backref = page.locator(`[id="${noteId}"] a[data-footnote-backref]`).first();
    await expect(backref).toBeVisible();
    const backHref = await backref.getAttribute("href");
    expect(backHref?.startsWith("#")).toBe(true);
    const refId = backHref!.slice(1);
    await expect(page.locator(`[id="${refId}"]`)).toHaveCount(1);

    // Non-color cue: underline present on footnote controls.
    const decoration = await firstRef.evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(decoration).toContain("underline");
  });

  test("prefers-reduced-motion disables smooth scrolling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(chapterPath, { waitUntil: "domcontentloaded", timeout: 30_000 });
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe("auto");
  });

  test("in-book search Escape restores focus to the trigger", async ({ page }) => {
    await page.goto(chapterPath, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.getByTestId("reader-overflow-open").click();
    await expect(page.getByTestId("reader-controls-drawer")).toBeVisible();
    await page.getByTestId("reader-tab-settings").click();
    const trigger = page.getByTestId("in-book-search-open");
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.getByTestId("in-book-search-dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("in-book-search-dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("exiting reader restores standard site chrome on book detail", async ({ page }) => {
    await page.goto(chapterPath, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await expect(page.getByRole("banner")).toHaveCount(0);
    await page.getByTestId("reader-exit").click();
    await expect(page).toHaveURL(/\/explore\/books\/after-certainty$/);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});

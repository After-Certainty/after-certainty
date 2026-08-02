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

    const article = page.getByRole("article");
    await expect(article).toBeVisible();

    const title = page.locator("#chapter-title");
    await expect(title).toBeVisible();
    await expect(title).toHaveAttribute("id", "chapter-title");

    const labelledBy = await article.getAttribute("aria-labelledby");
    expect(labelledBy).toBe("chapter-title");

    await expect(page.getByRole("navigation", { name: "Table of contents" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Previous and next chapter", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", {
        name: "Previous and next chapter at end of page",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Chapter scroll progress" })).toBeVisible();
    await expect(page.getByTestId("reader-exit")).toBeVisible();

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
});

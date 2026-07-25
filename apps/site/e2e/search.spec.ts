import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";
import {
  openQuickSearchWithShortcut,
  waitForSearchPaletteReady,
} from "./fixtures/search-palette";

const mainContent = "#main";

test.describe("global search", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("known concept query links to the concept page", async ({ page }) => {
    await page.goto("/search?q=certainty", { waitUntil: "domcontentloaded" });
    await expect(page.locator(mainContent)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Search" })).toBeVisible();

    const conceptLink = page.locator('a[href="/explore/concepts/certainty"]').first();
    await expect(conceptLink).toBeVisible({ timeout: 15_000 });

    await conceptLink.click();
    await expect(page).toHaveURL(/\/explore\/concepts\/certainty/);
    await expect(page.getByRole("heading", { level: 1, name: "Certainty" })).toBeVisible();
  });

  test("chapter filter surfaces native reader destinations", async ({ page }) => {
    await page.goto("/search?q=Introduction&type=chapter", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("heading", { level: 1, name: "Search" })).toBeVisible();

    const chapterLink = page
      .locator('a[href="/explore/books/after-certainty/chapters/front-matter-introduction"]')
      .first();
    await expect(chapterLink).toBeVisible({ timeout: 15_000 });
    await chapterLink.click();
    await expect(page).toHaveURL(
      /\/explore\/books\/after-certainty\/chapters\/front-matter-introduction$/,
    );
  });

  test("type filter is reflected in the URL", async ({ page }) => {
    await page.goto("/search?q=trust", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "Search" })).toBeVisible();

    const bookFilter = page.getByRole("button", { name: "Book", exact: true });
    await expect(bookFilter).toBeVisible({ timeout: 15_000 });
    await bookFilter.click();
    await expect(page).toHaveURL(/type=book/);
  });

  test("header quick search opens with Control+K and navigates to a result", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(mainContent)).toBeVisible();
    await waitForSearchPaletteReady(page);

    await openQuickSearchWithShortcut(page);
    const dialog = page.getByRole("dialog", { name: /Quick search/i });
    await expect(dialog).toBeVisible();

    const input = page.getByRole("searchbox", { name: /Quick search/i });
    await input.fill("certainty");

    const conceptOption = dialog.getByRole("option", { name: /Certainty/i }).first();
    await expect(conceptOption).toBeVisible({ timeout: 15_000 });
    await conceptOption.click();

    await expect(page).toHaveURL(/\/explore\/concepts\/certainty/);
  });

  test("mobile menu includes a Search entry that opens quick search", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(mainContent)).toBeVisible();
    // MobileNav + search palette are client islands; wait for hydration first.
    await waitForSearchPaletteReady(page);

    const menuButton = page.getByRole("button", { name: /Open menu/i });
    const navDialog = page.getByRole("dialog", { name: /Site navigation/i });
    await expect(async () => {
      if (await navDialog.isVisible()) return;
      await menuButton.click();
      await expect(navDialog).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 15_000 });

    const searchItem = page.getByTestId("mobile-nav-search");
    await expect(searchItem).toBeVisible();
    await expect(searchItem).toHaveText(/Search/i);

    await searchItem.click();
    await expect(page.getByRole("dialog", { name: /Quick search/i })).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

test.describe("Books catalog", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("default page shows Start Here and featured shelves", async ({ page }) => {
    await page.goto("/explore/books");
    await expect(page.getByRole("heading", { name: "Books", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Start Here", level: 2 })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Core After Certainty", level: 2 }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Complete catalog", level: 2 })).toBeVisible();
  });

  test("fiction shelf filter updates URL and results", async ({ page }) => {
    await page.goto("/explore/books?shelf=fiction");
    await expect(page).toHaveURL(/shelf=fiction/);
    await expect(page.getByRole("heading", { name: "Filtered catalog" })).toBeVisible();
    await expect(page.locator("#main").getByText("4 books")).toBeVisible();
    await expect(
      page.locator("#main").getByRole("heading", { name: "The Relay", level: 3 }),
    ).toBeVisible();
  });

  test("clearing filters returns bare books URL", async ({ page }) => {
    await page.goto("/explore/books?type=fiction&sort=title-asc");
    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page).toHaveURL("/explore/books");
  });

  test("navigates to book detail from catalog card", async ({ page }) => {
    await page.goto("/explore/books");
    await page
      .locator("#main")
      .getByRole("link", { name: /After Certainty/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/explore\/books\/after-certainty/);
  });

  test("mobile filter disclosure is operable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore/books?type=fiction");
    await page.getByText("Filter books").click();
    await expect(page.getByRole("group", { name: "Sort" })).toBeVisible();
  });
});

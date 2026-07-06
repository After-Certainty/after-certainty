import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";
import { siteConfig } from "../lib/site-config";

const mainContent = "#main";

const exploreSidebarLinks = [
  { href: "/explore", label: "Overview" },
  { href: "/explore/concepts", label: "Concepts" },
  { href: "/explore/patterns", label: "Patterns" },
  { href: "/explore/books", label: "Books" },
  { href: "/explore/sources", label: "Thinkers" },
] as const;

test.describe("navigation smoke", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("primary header navigation reaches each top-level page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const primaryNav = page.locator('nav[aria-label="Primary"]');

    for (const item of siteConfig.navigation) {
      await primaryNav.getByRole("link", { name: item.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${item.href.replace(/\//g, "\\/")}$`));
      await expect(page.locator(mainContent)).toBeVisible();
    }
  });

  test("explore sidebar navigation reaches each section index", async ({ page }) => {
    for (const item of exploreSidebarLinks) {
      await page.goto("/explore/books");

      const exploreNav = page.locator('nav[aria-label="Explore sections"]');
      await exploreNav.getByRole("link", { name: item.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${item.href.replace(/\//g, "\\/")}$`));
      await expect(page.locator(mainContent)).toBeVisible();
    }
  });
});

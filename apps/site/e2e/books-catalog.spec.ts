import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

test.describe("Books catalog", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("catalog cards use generated card covers", async ({ page }) => {
    await page.goto("/explore/books");
    // next/image rewrites local public paths to /_next/image?url=%2Fgenerated%2F...
    const cover = page
      .locator(
        "#main img[src*='_next/image'][src*='%2Fgenerated%2Fbook-covers%2F'][src*='card.webp']",
      )
      .first();
    await expect(cover).toBeVisible();
  });

  test("book detail hero uses generated detail cover", async ({ page }) => {
    await page.goto("/explore/books/after-certainty");
    const cover = page.locator(
      "#main img[src*='_next/image'][src*='%2Fgenerated%2Fbook-covers%2Fafter-certainty%2Fdetail.webp']",
    );
    await expect(cover).toBeVisible();
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
    // Upstream contentType: Boundary Conditions, The Relay, and Velorum.
    // Prefer the live-region summary — Filter & sort also shows a decorative count.
    await expect(
      page
        .locator("#main")
        .getByRole("paragraph")
        .filter({ hasText: /^3 books$/ }),
    ).toBeVisible();
    await expect(
      page.locator("#main").getByRole("heading", { name: "The Relay", level: 3 }),
    ).toBeVisible();
    await expect(
      page.locator("#main").getByRole("heading", { name: "Boundary Conditions", level: 3 }),
    ).toBeVisible();
  });

  test("dedicated shelf page lists ordered books and breadcrumbs", async ({ page }) => {
    await page.goto("/explore/books/shelves/start-here");
    await expect(page.getByRole("heading", { name: "Start Here", level: 1 })).toBeVisible();
    await expect(page.getByText("Curated shelf")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Books");
    await expect(
      page.locator("#main").getByRole("heading", { name: /Curiosity Before Certainty/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Other shelves", level: 2 })).toBeVisible();
  });

  test("View shelf from index navigates to dedicated shelf route", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore/books");
    await page
      .getByRole("link", { name: /View shelf|View all \d+ books/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/explore\/books\/shelves\//);
    await expect(page.getByText("Curated shelf")).toBeVisible();
  });

  test("unknown shelf slug returns 404", async ({ page }) => {
    const response = await page.goto("/explore/books/shelves/not-a-real-shelf");
    expect(response?.status()).toBe(404);
  });

  test("poetry type filter shows Observer Patterns and survives reload", async ({ page }) => {
    await page.goto("/explore/books?type=poetry");
    await expect(page).toHaveURL(/type=poetry/);
    await expect(page.getByRole("link", { name: /Poetry\s+Observer Patterns/i })).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/type=poetry/);
    await expect(page.getByRole("link", { name: /Poetry\s+Observer Patterns/i })).toBeVisible();

    await page.goBack();
    await page.goForward();
    await expect(page).toHaveURL(/type=poetry/);
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
    await page.getByText("Filter & sort").click();
    await expect(page.getByRole("group", { name: "Sort" })).toBeVisible();
  });

  test("mobile shelves use accordion and omit local title search", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore/books");

    await expect(page.getByLabel("Search books")).toHaveCount(0);
    await expect(page.getByPlaceholder("Search by title…")).toHaveCount(0);

    const startHere = page.getByRole("button", { name: /Start Here/i });
    await expect(startHere).toBeVisible();
    await expect(startHere).toHaveAttribute("aria-expanded", "true");

    const coreShelf = page.getByRole("button", { name: /Core After Certainty/i });
    await expect(coreShelf).toBeVisible();
    await expect(coreShelf).toHaveAttribute("aria-expanded", "false");

    await coreShelf.click();
    await expect(coreShelf).toHaveAttribute("aria-expanded", "true");
    await expect(startHere).toHaveAttribute("aria-expanded", "true");

    const thumb = page
      .locator(
        "#main img[src*='_next/image'][src*='%2Fgenerated%2Fbook-covers%2F'][src*='thumbnail.webp']",
      )
      .first();
    await expect(thumb).toBeVisible();
  });

  test("enriched book overview shows Inside this book and work-specific roles", async ({
    page,
  }) => {
    await page.goto("/explore/books/after-certainty");
    await expect(page.getByRole("heading", { name: "After Certainty", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Inside this book", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Central ideas", level: 2 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore the concept" }).first()).toBeVisible();
    await expect(page.locator("#inside")).toContainText(/min/i);
  });

  test("book overview Read CTA opens the first public chapter", async ({ page }) => {
    await page.goto("/explore/books/after-certainty");
    const read = page.getByRole("link", { name: "Read book", exact: true });
    await expect(read).toBeVisible();
    await expect(read).toHaveAttribute(
      "href",
      "/explore/books/after-certainty/chapters/front-matter-introduction",
    );
    await read.click();
    await expect(page).toHaveURL(
      /\/explore\/books\/after-certainty\/chapters\/front-matter-introduction$/,
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".chapter-manuscript")).toBeVisible();
  });

  test("Inside this book links open a chapter route", async ({ page }) => {
    await page.goto("/explore/books/after-certainty");
    const intro = page.locator("#inside").getByRole("link", { name: "Introduction", exact: true });
    await expect(intro).toBeVisible();
    await intro.click();
    await expect(page).toHaveURL(
      /\/explore\/books\/after-certainty\/chapters\/front-matter-introduction$/,
    );
  });

  test("fiction and poetry books expose chapter structure", async ({ page }) => {
    await page.goto("/explore/books/the-relay");
    await expect(page.getByRole("heading", { name: "Inside this book", level: 2 })).toBeVisible();

    await page.goto("/explore/books/observer-patterns");
    await expect(page.getByRole("heading", { name: "Inside this book", level: 2 })).toBeVisible();
    await expect(page.locator("#inside")).toContainText(/Poem/i);
  });

  test("pattern detail shows restrained grounding when present", async ({ page }) => {
    await page.goto("/explore/patterns/attention-finds-a-focus");
    await expect(page.getByText("Grounding", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Original synthesis")).toBeVisible();
  });
});

import { expect, test, type Page } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

const MASTER = "/explore/patterns/reality-answers-back";
const SUPPORTING = "/explore/patterns/authority-follows-attention";
const THIN = "/explore/patterns/meaning-forms-early";

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });
  expect(overflow).toBe(false);
}

test.describe("Patterns mobile redesign", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("master detail densifies intro, forces, concepts, and books @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(MASTER);

    await expect(page.getByRole("heading", { name: /Reality Answers Back/i, level: 1 })).toBeVisible();
    await expect(page.getByText(/Master pattern/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Read full description/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "At a glance" })).toBeVisible();

    const forceToggle = page.getByRole("button", { name: /Perception|Power|Time|Contact/i }).first();
    await expect(forceToggle).toBeVisible();
    await expect(forceToggle).toHaveAttribute("aria-expanded", "false");
    await forceToggle.click();
    await expect(forceToggle).toHaveAttribute("aria-expanded", "true");

    const conceptsToggle = page.getByRole("button", { name: /Related concepts/i });
    await expect(conceptsToggle).toBeVisible();
    await expect(conceptsToggle).toHaveAttribute("aria-expanded", "false");
    await conceptsToggle.click();
    await expect(conceptsToggle).toHaveAttribute("aria-expanded", "true");

    const bookRows = page.locator("[data-compact-book-row]");
    await expect(bookRows.first()).toBeVisible();
    expect(await bookRows.count()).toBeGreaterThan(1);

    await expect(page.getByRole("link", { name: /Open in graph/i }).first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("supporting detail collapses related concepts and shows book rows @ 390", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(SUPPORTING);

    await expect(
      page.getByRole("heading", { name: /Authority Follows Attention/i, level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(/Supporting/i).first()).toBeVisible();

    const conceptsToggle = page.getByRole("button", { name: /Related concepts/i });
    await expect(conceptsToggle).toHaveAttribute("aria-expanded", "false");
    await conceptsToggle.click();
    await expect(conceptsToggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /View Concept/i }).first()).toBeVisible();

    await expect(page.locator("[data-compact-book-row]").first()).toBeVisible();
    await expect(page.getByRole("navigation", { name: /Previous and next pattern/i })).toBeVisible();
  });

  test("thin-metadata pattern omits empty glance shells and shows one book @ 390", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(THIN);

    await expect(
      page.getByRole("heading", { name: /Meaning Forms Early/i, level: 1 }),
    ).toBeVisible();

    const glance = page.locator("#pattern-at-a-glance-heading");
    if (await glance.count()) {
      await expect(page.getByText("Why it matters")).toHaveCount(0);
    }

    await expect(page.locator("[data-compact-book-row]")).toHaveCount(1);
  });

  test("no horizontal overflow and prev/next wrap @ 320", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(SUPPORTING);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /Previous and next pattern/i })).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("footer stays compact on mobile and usable on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explore/patterns");

    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: /^Search$/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /Explore patterns/i })).toBeVisible();
    await expect(footer.getByLabel("Social profiles")).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/explore/patterns");
    await expect(footer.getByText("Together")).toBeVisible();
    await expect(footer.getByRole("link", { name: /Privacy & cookies/i })).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});

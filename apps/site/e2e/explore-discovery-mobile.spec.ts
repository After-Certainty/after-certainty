import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";
import { assertNoHorizontalOverflow } from "./fixtures/overflow";

const CONCEPT_DETAIL = "/explore/concepts/certainty";
const CONCEPTS_INDEX = "/explore/concepts";
const THINKERS_FILTERED = "/explore/thinkers?type=organization&sort=name-asc";
const SOURCES_FILTERED = "/explore/sources?kind=article&sort=title-asc";
const QUESTION_DETAIL = "/questions/act-before-certainty-arrives";
const TRAIL_DETAIL = "/trails/systems-without-correction";

test.describe("Explore discovery mobile redesign", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("concepts index editorial density @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(CONCEPTS_INDEX);

    await expect(page.getByRole("heading", { name: "Concepts", level: 1 })).toBeVisible();
    await expect(page.locator('[data-density="editorial"]')).toBeVisible();
    await expect(page.getByText(/\d+ concepts?/i).first()).toBeVisible();
    await expect(page.getByText("View Concept →").first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("concept detail disclosures and adjacent nav @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(CONCEPT_DETAIL);

    await expect(page.getByRole("heading", { name: "Certainty", level: 1 })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: /Previous and next concept/i }),
    ).toBeVisible();

    const introToggle = page.getByRole("button", { name: /Read full definition/i });
    if (await introToggle.count()) {
      await expect(introToggle).toHaveAttribute("aria-expanded", "false");
      await introToggle.click();
      await expect(introToggle).toHaveAttribute("aria-expanded", "true");
    }

    const relatedToggle = page
      .getByRole("button", { name: /Related (concepts|patterns|books)|Thinkers & sources/i })
      .first();
    if (await relatedToggle.count()) {
      await expect(relatedToggle).toHaveAttribute("aria-expanded", "false");
      await relatedToggle.click();
      await expect(relatedToggle).toHaveAttribute("aria-expanded", "true");
    }

    await assertNoHorizontalOverflow(page);
  });

  test("no horizontal overflow on atlas routes @ 320", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });

    await page.goto(CONCEPTS_INDEX);
    await expect(page.getByRole("heading", { name: "Concepts", level: 1 })).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.goto(CONCEPT_DETAIL);
    await expect(page.getByRole("heading", { name: "Certainty", level: 1 })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: /Previous and next concept/i }),
    ).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("thinkers filter+sort deep-link operable @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(THINKERS_FILTERED);

    await expect(page.getByRole("heading", { name: "Thinkers", level: 1 })).toBeVisible();
    await expect(page.locator('[data-density="editorial"]')).toBeVisible();

    const filterSummary = page.locator("#main").getByText("Filter & sort");
    await expect(filterSummary).toBeVisible();
    await filterSummary.click();

    await expect(page.getByRole("button", { name: "Organization", pressed: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Name A–Z", pressed: true })).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("sources filter+sort deep-link operable @ 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(SOURCES_FILTERED);

    await expect(page.getByRole("heading", { name: "Sources", level: 1 })).toBeVisible();
    await expect(page.locator('[data-density="editorial"]')).toBeVisible();

    await page.locator("#main").getByText("Filter & sort").click();
    await expect(page.getByRole("button", { name: "article", pressed: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Title A–Z", pressed: true })).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("questions and trails path surfaces @ 390 and @ 320", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/questions");
    await expect(page.locator('[data-path-index-density="editorial"]')).toBeVisible();
    await expect(page.locator("[data-path-index-featured]")).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.goto(QUESTION_DETAIL);
    await expect(
      page.getByRole("heading", {
        name: "How can we act responsibly before certainty arrives?",
        level: 1,
      }),
    ).toBeVisible();
    await expect(page.locator('[data-path-stop-density="compact"]').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.goto("/trails");
    await expect(page.locator('[data-path-index-density="editorial"]')).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.goto(TRAIL_DETAIL);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('[data-path-stop-density="compact"]').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(QUESTION_DETAIL);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.goto(TRAIL_DETAIL);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("desktop smoke keeps disclosures open from md", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto(CONCEPT_DETAIL);
    await expect(page.getByRole("heading", { name: "Certainty", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /Read full definition/i })).toHaveCount(0);
    const relatedHeading = page.getByRole("heading", { name: /Related concepts|Related patterns|Related books/i }).first();
    if (await relatedHeading.count()) {
      await expect(relatedHeading).toBeVisible();
    }

    await page.goto(THINKERS_FILTERED);
    await expect(page.getByRole("button", { name: "Organization", pressed: true })).toBeVisible();

    await page.goto(SOURCES_FILTERED);
    await expect(page.getByRole("button", { name: "article", pressed: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Title A–Z", pressed: true })).toBeVisible();

    await page.goto(QUESTION_DETAIL);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Keep exploring" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Related reading trail/i })).toBeVisible();

    await page.goto(TRAIL_DETAIL);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Related trails" })).toBeVisible();
  });
});

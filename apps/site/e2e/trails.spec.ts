import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";

test.describe("Curated Reading Trails", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  test("trails index lists published trails", async ({ page }) => {
    await page.goto("/trails");
    await expect(
      page.getByRole("heading", {
        name: "Follow a deliberate path through the commons",
        level: 1,
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured trails" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Judgment Before Certainty/i }).first(),
    ).toBeVisible();
  });

  test("visitor can follow a trail stop to a canonical destination", async ({ page }) => {
    await page.goto("/trails/judgment-before-certainty");
    await expect(
      page.getByRole("heading", { name: "Judgment Before Certainty", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Stop 1 of")).toBeVisible();

    const conceptLink = page.getByRole("link", { name: /Open Judgment \(Concept\)/i });
    await expect(conceptLink).toBeVisible();
    await conceptLink.click();
    await expect(page).toHaveURL(/\/explore\/concepts\/judgment/);
  });

  test("visitor can return to trail and open a related trail", async ({ page }) => {
    await page.goto("/trails/judgment-before-certainty");
    await page.getByRole("link", { name: /Browse all reading trails/i }).click();
    await expect(page).toHaveURL("/trails");

    await page.goto("/trails/systems-without-correction");
    await expect(page.getByRole("heading", { name: "Related trails" })).toBeVisible();
    await page.getByRole("link", { name: /After Certainty for Software Engineers/i }).click();
    await expect(page).toHaveURL("/trails/software-judgment-trail");
  });

  test("theme filter narrows trails index", async ({ page }) => {
    await page.goto("/trails?theme=judgment");
    await expect(page.getByRole("navigation", { name: "Trail themes" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Judgment Before Certainty" })).toBeVisible();
  });

  test("trail shows multiple entity types and optional stop", async ({ page }) => {
    await page.goto("/trails/meaning-under-pressure");
    await expect(page.getByRole("link", { name: /Open Meaning \(Concept\)/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Open How Meaning Moves \(Book\)/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Open How Meaning Moves \(Podcast episode/i }),
    ).toBeVisible();
    await expect(page.locator("text=Optional").first()).toBeVisible();
  });

  test("start here surfaces reading trails section", async ({ page }) => {
    await page.goto("/start");
    await expect(page.getByRole("heading", { name: "Follow a reading trail" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Browse all reading trails/i })).toBeVisible();
  });

  test("mobile viewport renders trail detail", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/trails/leadership-after-the-person");
    await expect(page.locator("#main")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Leadership After the Person", level: 1 }),
    ).toBeVisible();
  });

  test("search shows curated trails for matching query", async ({ page }) => {
    await page.goto("/search?q=reading+trail+judgment");
    await expect(page.getByRole("heading", { name: "Curated reading trails" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Judgment Before Certainty/i })).toBeVisible();
  });
});

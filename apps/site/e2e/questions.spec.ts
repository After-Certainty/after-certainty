import { expect, test } from "@playwright/test";

test.describe("Start with a Question", () => {
  test("homepage surfaces featured questions", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "What question brought you here?" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Follow this question/i }).first()).toBeVisible();
  });

  test("visitor can follow a question path to a book", async ({ page }) => {
    await page.goto("/questions/trust-survives-disagreement");
    await expect(
      page.getByRole("heading", { name: "How can trust survive disagreement?", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Stop 1 of")).toBeVisible();

    const bookLink = page.getByRole("link", { name: /Open Trust Beyond Similarity \(Book\)/i });
    await expect(bookLink).toBeVisible();
    await bookLink.click();
    await expect(page).toHaveURL(/\/explore\/books\/trust-beyond-similarity/);
  });

  test("questions index groups published questions", async ({ page }) => {
    await page.goto("/questions");
    await expect(
      page.getByRole("heading", { name: "Begin with a tension you recognize", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured questions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Trust and disagreement" })).toBeVisible();
  });

  test("search shows curated questions for matching query", async ({ page }) => {
    await page.goto("/search?q=trust+disagreement");
    await expect(page.getByRole("heading", { name: "Curated questions" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /How can trust survive disagreement/i }),
    ).toBeVisible();
  });
});

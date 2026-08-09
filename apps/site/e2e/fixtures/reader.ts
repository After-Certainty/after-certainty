import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Live chapter reader shell inside `#main`.
 *
 * Next.js streaming/soft-nav can briefly keep a Suspense copy under `#S:0`
 * alongside the real article; unscoped locators then hit strict-mode
 * violations or click dead controls. Prefer the in-main article.
 */
export function liveReader(page: Page): Locator {
  return page.locator("main#main article[data-chapter-reader]");
}

/**
 * Wait until the live chapter reader chrome is ready for interaction.
 */
export async function waitForStableReaderChrome(page: Page): Promise<Locator> {
  const reader = liveReader(page);
  await expect(reader).toHaveCount(1, { timeout: 15_000 });
  await expect(reader.getByTestId("reading-progress-chrome")).toHaveCount(1, {
    timeout: 15_000,
  });
  await expect(reader).toBeVisible();
  return reader;
}

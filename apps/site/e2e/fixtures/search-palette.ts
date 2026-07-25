import { expect, type Page } from "@playwright/test";

/** Header Search control (client island). */
export function headerSearchButton(page: Page) {
  return page.getByRole("button", { name: /^Search$/i }).first();
}

/**
 * Wait until the search palette client island is interactive.
 * `domcontentloaded` alone is not enough — Mod+K / drawer clicks no-op pre-hydration.
 */
export async function waitForSearchPaletteReady(page: Page): Promise<void> {
  const trigger = headerSearchButton(page);
  await expect(trigger).toBeVisible({ timeout: 15_000 });

  const dialog = page.getByRole("dialog", { name: /Quick search/i });
  await expect(async () => {
    if (await dialog.isVisible()) return;
    await trigger.click();
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 15_000 });

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
}

/** Open quick search via Mod+K once the shortcut listener is live. */
export async function openQuickSearchWithShortcut(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog", { name: /Quick search/i });
  await expect(async () => {
    if (await dialog.isVisible()) return;
    await page.keyboard.press("ControlOrMeta+KeyK");
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
}

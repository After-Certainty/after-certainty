import { expect, type Page } from "@playwright/test";

/** Fail if the document can scroll horizontally (overflow beyond the viewport). */
export async function assertNoHorizontalOverflow(page: Page) {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const before = window.scrollX;
    window.scrollTo(200, window.scrollY);
    const after = window.scrollX;
    window.scrollTo(before, window.scrollY);
    return {
      couldScroll: after !== before,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });
  expect(
    result.couldScroll,
    `page can scroll horizontally (scrollWidth=${result.scrollWidth}, clientWidth=${result.clientWidth})`,
  ).toBe(false);
}

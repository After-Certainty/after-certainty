import { expect, test } from "@playwright/test";

import { dismissCookieBanner } from "./fixtures/consent";
import { smokeUrls } from "./fixtures/smoke-urls";
import { checkInternalLink, collectInternalLinks } from "./helpers/link-checker";

const mainContent = "#main";

test.describe("broken links", () => {
  test.describe.configure({ mode: "serial" });

  const checkedLinks = new Map<string, string>();

  test.beforeEach(async ({ context, baseURL }) => {
    await dismissCookieBanner(context, baseURL ?? "http://127.0.0.1:3000");
  });

  for (const { path, label } of smokeUrls) {
    test(`${label} (${path}) has no broken internal links`, async ({ page, request, baseURL }) => {
      const origin = baseURL ?? "http://127.0.0.1:3000";
      const timeout = path === "/explore" ? 30_000 : 15_000;

      await page.goto(path, { waitUntil: "domcontentloaded", timeout });
      await expect(page.locator(mainContent)).toBeVisible({ timeout });

      const hrefs = await collectInternalLinks(page);
      const failures: string[] = [];

      for (const href of hrefs) {
        if (checkedLinks.has(href)) continue;
        checkedLinks.set(href, path);

        const result = await checkInternalLink(request, origin, href, path);
        if (!result.ok) {
          failures.push(`${href} returned ${result.status} (found on ${path})`);
        }
      }

      expect(
        failures,
        failures.length > 0
          ? `Broken links on ${path}:\n${failures.join("\n")}\nChecked ${hrefs.length} links on this page.`
          : undefined,
      ).toEqual([]);
    });
  }
});

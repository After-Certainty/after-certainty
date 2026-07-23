import type { APIRequestContext, Page } from "@playwright/test";

const SUCCESS_STATUSES = new Set([200, 201, 204, 301, 302, 307, 308]);

export type LinkCheckResult = {
  href: string;
  status: number;
  ok: boolean;
  fromPage: string;
};

/** Collect same-origin relative links from the current page. */
export async function collectInternalLinks(page: Page): Promise<string[]> {
  const hrefs = await page.locator('a[href^="/"]').evaluateAll((anchors) =>
    anchors
      .map((anchor) => anchor.getAttribute("href") ?? "")
      .filter((href) => href.length > 0 && !href.startsWith("//") && !href.startsWith("/#")),
  );

  return [...new Set(hrefs)];
}

/** Verify an internal link returns a successful HTTP status (with redirects followed). */
export async function checkInternalLink(
  request: APIRequestContext,
  baseURL: string,
  href: string,
  fromPage: string,
): Promise<LinkCheckResult> {
  const url = new URL(href, baseURL).toString();
  const response = await request.get(url, { maxRedirects: 5 });
  const status = response.status();

  return {
    href,
    status,
    ok: SUCCESS_STATUSES.has(status),
    fromPage,
  };
}

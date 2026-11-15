import { type BrowserContext, type Page } from "@playwright/test";

/**
 * GA cookie banner removed (Gate 4). Kept as no-ops so existing e2e imports compile.
 */
export async function dismissCookieBanner(
  context: BrowserContext,
  baseURL: string,
): Promise<void> {
  void context;
  void baseURL;
}

export async function expectCookieBannerHidden(page: Page): Promise<void> {
  void page;
}

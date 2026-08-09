import { expect, type BrowserContext, type Page } from "@playwright/test";

const CONSENT_COOKIE_NAME = "ac_cookie_consent";

/** Dismiss the cookie banner so it does not intercept navigation clicks. */
export async function dismissCookieBanner(context: BrowserContext, baseURL: string): Promise<void> {
  await context.addCookies([
    {
      name: CONSENT_COOKIE_NAME,
      value: "denied",
      url: baseURL.replace(/\/$/, "") + "/",
    },
  ]);
}

/** Wait until any cookie dialog is gone (consent hydrated from the pre-set cookie). */
export async function expectCookieBannerHidden(page: Page): Promise<void> {
  await expect(page.getByRole("dialog", { name: "Cookies & analytics" })).toHaveCount(0, {
    timeout: 15_000,
  });
}

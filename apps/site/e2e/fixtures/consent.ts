import type { BrowserContext } from "@playwright/test";

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

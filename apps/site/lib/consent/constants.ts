/** Cookie storing analytics opt-in/out (`granted` | `denied`). */
export const CONSENT_COOKIE_NAME = "ac_cookie_consent";

export const CONSENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ConsentValue = "granted" | "denied";

export type ConsentState = ConsentValue | "unknown";

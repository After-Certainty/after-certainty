/** Cookie storing analytics opt-in/out (`granted` | `denied`). */
export const CONSENT_COOKIE_NAME = "ac_cookie_consent";

export const CONSENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ConsentValue = "granted" | "denied";

export type ConsentState = ConsentValue | "unknown";

/**
 * Regions where Google historically recommends stricter consent defaults (EEA, UK, Switzerland).
 * Site policy denies analytics globally until Accept (see consent-defaults-script.ts); this list
 * remains for documentation and potential future regional messaging.
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */
export const REGULATED_CONSENT_REGIONS = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
  "GB",
  "CH",
] as const;

import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  type ConsentState,
  type ConsentValue,
} from "@/lib/consent/constants";

function parseConsentValue(raw: string | undefined): ConsentValue | null {
  if (raw === "granted" || raw === "denied") return raw;
  return null;
}

/** Read stored consent from `document.cookie` (client only). */
export function getConsent(): ConsentState {
  if (typeof document === "undefined") return "unknown";
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`));
  const parsed = parseConsentValue(match?.[1] ? decodeURIComponent(match[1]) : undefined);
  return parsed ?? "unknown";
}

/** Persist consent choice for one year. */
export function setConsent(value: ConsentValue): void {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  const secure =
    typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${encoded}; Path=/; Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "granted";
}

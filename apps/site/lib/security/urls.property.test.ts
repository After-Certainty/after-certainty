import { test, fc } from "@fast-check/vitest";
import { expect } from "vitest";

import { isHttpOrHttpsUrl, isSafeHref } from "@/lib/security/urls";

const PROP = { seed: 20260919, numRuns: 128 } as const;

const DANGEROUS_SCHEME = /^(javascript|data|vbscript|file):/i;

test.prop([fc.string({ maxLength: 200 })], PROP)(
  "isSafeHref never throws and never accepts dangerous schemes",
  (href) => {
    let safe: boolean;
    expect(() => {
      safe = isSafeHref(href);
    }).not.toThrow();
    if (safe!) {
      const trimmed = href.trim();
      expect(DANGEROUS_SCHEME.test(trimmed)).toBe(false);
      // Accepted forms: absolute path, hash, mailto (without javascript:), or http(s).
      const ok =
        trimmed.startsWith("/") ||
        trimmed.startsWith("#") ||
        (trimmed.toLowerCase().startsWith("mailto:") &&
          !trimmed.toLowerCase().includes("javascript:")) ||
        isHttpOrHttpsUrl(trimmed);
      expect(ok).toBe(true);
    }
  },
);

test.prop([fc.string({ maxLength: 200 })], PROP)(
  "isHttpOrHttpsUrl never throws and only accepts http(s) protocols",
  (href) => {
    let ok: boolean;
    expect(() => {
      ok = isHttpOrHttpsUrl(href);
    }).not.toThrow();
    if (ok!) {
      const parsed = new URL(href);
      expect(parsed.protocol === "http:" || parsed.protocol === "https:").toBe(true);
    }
  },
);

test.prop(
  [
    fc.constantFrom(
      "javascript:alert(1)",
      "JAVASCRIPT:alert(1)",
      "data:text/html,hi",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
    ),
  ],
  PROP,
)("known hostile schemes are rejected by isSafeHref", (href) => {
  expect(isSafeHref(href)).toBe(false);
  expect(isHttpOrHttpsUrl(href)).toBe(false);
});

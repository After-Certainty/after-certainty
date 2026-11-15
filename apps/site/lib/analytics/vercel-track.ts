import { track } from "@vercel/analytics";

type VercelPropValue = string | number | boolean | null | undefined;

/**
 * Install the same client queue stub `@vercel/analytics` uses inside `inject()`.
 *
 * `track()` does **not** call `initQueue` itself. Mount-time reader effects
 * (e.g. `QuestionPathAnalytics`) can run before `<Analytics />` injects the
 * script; without this stub, `window.va` is undefined and custom events are
 * silently dropped while consent-gated GA still records.
 */
export function ensureVercelAnalyticsQueue(): void {
  if (typeof window === "undefined") return;
  const w = window as Window & {
    va?: (...args: unknown[]) => void;
    vaq?: unknown[];
  };
  if (typeof w.va === "function") return;
  w.va = (...params: unknown[]) => {
    (w.vaq ??= []).push(params);
  };
}

function vercelProps(
  properties: Record<string, VercelPropValue>,
): Record<string, string | number | boolean | null> {
  const cleaned: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined) cleaned[key] = value;
  }
  return cleaned;
}

/** Best-effort Vercel custom event; never throws into UI handlers. */
export function trackVercelEvent(
  name: string,
  properties: Record<string, VercelPropValue> = {},
): void {
  try {
    ensureVercelAnalyticsQueue();
    track(name, vercelProps(properties));
  } catch {
    // Measurement must not block navigation, selection, or playback.
  }
}

/**
 * Simple in-memory sliding-window rate limiter for serverless-ish use.
 * Best-effort on multi-instance deploys; sufficient to blunt casual abuse.
 */

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Max events allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Clock override for tests. */
  now?: () => number;
};

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = options.now?.() ?? Date.now();
  const windowStart = now - options.windowMs;
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= options.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));
    return { ok: false, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  return { ok: true };
}

/** Test helper — clears all buckets. */
export function resetRateLimitBuckets(): void {
  buckets.clear();
}

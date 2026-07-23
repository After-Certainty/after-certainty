import { NextResponse } from "next/server";

import {
  isCacheRevalidateAuthorized,
  isCacheRevalidateConfigured,
  parseCacheRevalidateTargets,
  revalidateCacheTargets,
} from "@/lib/cache/revalidate";
import { checkRateLimit } from "@/lib/security/rate-limit";

const UNAUTH_RATE_LIMIT = 20;
const UNAUTH_WINDOW_MS = 15 * 60 * 1000;

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(request: Request) {
  if (!isCacheRevalidateConfigured()) {
    return NextResponse.json(
      { error: "Cache revalidation is not configured on this deployment." },
      { status: 503 },
    );
  }

  if (!isCacheRevalidateAuthorized(request)) {
    const ipLimit = checkRateLimit(`revalidate:unauth:${clientIp(request)}`, {
      limit: UNAUTH_RATE_LIMIT,
      windowMs: UNAUTH_WINDOW_MS,
    });
    if (!ipLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        },
      );
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = null;
  try {
    const text = await request.text();
    if (text.length > 0) {
      body = JSON.parse(text) as unknown;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawTargets =
    body && typeof body === "object" && body !== null && "targets" in body
      ? (body as { targets: unknown }).targets
      : undefined;

  const targets = parseCacheRevalidateTargets(rawTargets);
  if (!targets) {
    return NextResponse.json(
      { error: 'Expected optional JSON body { "targets": ["podcast", "semantic"] }' },
      { status: 400 },
    );
  }

  revalidateCacheTargets(targets);

  return NextResponse.json({ ok: true, revalidated: targets }, { status: 200 });
}

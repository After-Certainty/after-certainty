import { NextResponse } from "next/server";

import { outboundFetchSignal } from "@/lib/security/fetch";
import { checkRateLimit, resetRateLimitBuckets } from "@/lib/security/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_BODY_BYTES = 4096;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_PER_EMAIL = 5;
const RATE_LIMIT_PER_IP = 20;

function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_RE.test(email);
}

function beehiivSubscribeUrl(publicationId: string): string {
  const id = encodeURIComponent(publicationId);
  return `https://api.beehiiv.com/v2/publications/${id}/subscriptions`;
}

/** Pull a safe user-facing string from beehiiv error JSON without leaking internals */
function safeBeehiivMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  if (typeof o.message === "string" && o.message.length > 0 && o.message.length < 300) {
    return o.message;
  }
  return null;
}

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

/** Test helper — clears subscribe rate-limit buckets. */
export function resetSubscribeRateLimitsForTests(): void {
  resetRateLimitBuckets();
}

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const n = Number.parseInt(contentLength, 10);
      if (Number.isFinite(n) && n > MAX_BODY_BYTES) {
        return NextResponse.json({ error: "Request body too large" }, { status: 413 });
      }
    }

    let text: string;
    try {
      text = await request.text();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    let body: unknown;
    try {
      body = text.length === 0 ? null : (JSON.parse(text) as unknown);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("email" in body) ||
      typeof (body as { email: unknown }).email !== "string"
    ) {
      return NextResponse.json({ error: "Expected JSON body with { email }" }, { status: 400 });
    }

    const email = (body as { email: string }).email.trim();
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const ip = clientIp(request);
    const emailKey = `subscribe:email:${email.toLowerCase()}`;
    const ipKey = `subscribe:ip:${ip}`;

    const emailLimit = checkRateLimit(emailKey, {
      limit: RATE_LIMIT_PER_EMAIL,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });
    if (!emailLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(emailLimit.retryAfterSeconds) },
        },
      );
    }

    const ipLimit = checkRateLimit(ipKey, {
      limit: RATE_LIMIT_PER_IP,
      windowMs: RATE_LIMIT_WINDOW_MS,
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

    const apiKey = process.env.NEWSLETTER_API_KEY;
    const publicationId = process.env.NEWSLETTER_PUBLICATION_ID;

    if (!apiKey?.trim() || !publicationId?.trim()) {
      return NextResponse.json(
        { error: "Newsletter signup is temporarily unavailable." },
        { status: 500 },
      );
    }

    let beehiivRes: Response;
    try {
      beehiivRes = await fetch(beehiivSubscribeUrl(publicationId.trim()), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          tier: "free",
          send_welcome_email: true,
        }),
        signal: outboundFetchSignal(),
      });
    } catch {
      return NextResponse.json(
        { error: "Could not complete signup. Please try again later." },
        { status: 502 },
      );
    }

    if (beehiivRes.ok) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    let payload: unknown;
    try {
      payload = await beehiivRes.json();
    } catch {
      payload = null;
    }

    const remoteMsg = safeBeehiivMessage(payload);

    if (beehiivRes.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    if (beehiivRes.status >= 400 && beehiivRes.status < 500) {
      return NextResponse.json(
        {
          error: remoteMsg ?? "Could not subscribe. Check your email address and try again.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Could not complete signup. Please try again later." },
      { status: 502 },
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

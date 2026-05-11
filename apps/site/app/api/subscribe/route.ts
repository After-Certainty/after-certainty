import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
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

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
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

    const apiKey = process.env.NEWSLETTER_API_KEY;
    const publicationId = process.env.NEWSLETTER_PUBLICATION_ID;

    if (!apiKey?.trim() || !publicationId?.trim()) {
      return NextResponse.json(
        { error: "Newsletter signup is temporarily unavailable." },
        { status: 500 },
      );
    }

    const beehiivRes = await fetch(beehiivSubscribeUrl(publicationId.trim()), {
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
    });

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
          error:
            remoteMsg ??
            "Could not subscribe. Check your email address and try again.",
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

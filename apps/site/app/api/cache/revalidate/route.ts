import { NextResponse } from "next/server";

import {
  isCacheRevalidateAuthorized,
  isCacheRevalidateConfigured,
  parseCacheRevalidateTargets,
  revalidateCacheTargets,
} from "@/lib/cache/revalidate";

export async function POST(request: Request) {
  if (!isCacheRevalidateConfigured()) {
    return NextResponse.json(
      { error: "Cache revalidation is not configured on this deployment." },
      { status: 503 },
    );
  }

  if (!isCacheRevalidateAuthorized(request)) {
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
      { error: 'Expected optional JSON body { "targets": ["podcast", "semantic", "books"] }' },
      { status: 400 },
    );
  }

  revalidateCacheTargets(targets);

  return NextResponse.json({ ok: true, revalidated: targets }, { status: 200 });
}

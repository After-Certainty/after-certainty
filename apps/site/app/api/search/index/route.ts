import { NextResponse } from "next/server";

import { getSearchIndexPayload } from "@/lib/search/indexPayload";

/**
 * GET /api/search/index
 *
 * Public JSON search corpus for client-side MiniSearch.
 * Built from the same ISR loaders as Explore (semantic + books + podcast + aliases).
 */
export async function GET() {
  try {
    const payload = await getSearchIndexPayload();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[search-index] failed to build payload", err);
    return NextResponse.json({ error: "Search index unavailable" }, { status: 503 });
  }
}

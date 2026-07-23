import { NextResponse } from "next/server";
import { resolvePodcastRssUrl } from "@/lib/site-config";

/**
 * Legacy path from early stubs — redirect to the live podcast RSS so subscribers and
 * podcast apps still resolve a stable URL on this domain if needed.
 */
export function GET() {
  return NextResponse.redirect(resolvePodcastRssUrl(), 307);
}

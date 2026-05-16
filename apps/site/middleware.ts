import { type NextRequest, NextResponse } from "next/server";
import { shouldStripRangeForSocialCrawler } from "@/lib/seo/social-crawler-request";

export function middleware(request: NextRequest) {
  if (
    shouldStripRangeForSocialCrawler(
      request.headers.get("user-agent"),
      request.headers.has("range"),
    )
  ) {
    const headers = new Headers(request.headers);
    headers.delete("range");
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/opengraph-image", "/opengraph-image/:path*"],
};

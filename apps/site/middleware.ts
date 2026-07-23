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
  matcher: [
    /* Apply to HTML routes, not static assets. Meta sends Range on document fetches. */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|webp|svg|woff2?|css|js)$).*)",
  ],
};

import { OPEN_GRAPH_CRAWLER_USER_AGENTS } from "@/lib/seo/open-graph-crawlers";

/** True when the UA looks like a link-preview bot (Facebook, Slack, Apple, etc.). */
export function isSocialPreviewCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const lower = userAgent.toLowerCase();
  return OPEN_GRAPH_CRAWLER_USER_AGENTS.some((token) => lower.includes(token.toLowerCase()));
}

/**
 * Meta's crawler sends `Range` on image fetches; that can break Next.js `opengraph-image`
 * routes while HTML metadata still scrapes — title/description without image on Facebook posts.
 */
export function shouldStripRangeForSocialCrawler(
  userAgent: string | null,
  hasRangeHeader: boolean,
): boolean {
  return hasRangeHeader && isSocialPreviewCrawler(userAgent);
}

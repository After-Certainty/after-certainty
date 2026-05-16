import { OPEN_GRAPH_CRAWLER_USER_AGENTS } from "@/lib/seo/open-graph-crawlers";

/** True when the UA looks like a link-preview bot (Facebook, Slack, Apple, etc.). */
export function isSocialPreviewCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const lower = userAgent.toLowerCase();
  return OPEN_GRAPH_CRAWLER_USER_AGENTS.some((token) => lower.includes(token.toLowerCase()));
}

/**
 * Meta's crawler sends `Range` on page and image fetches. That can break Next.js App Router
 * responses (500/empty body) while other bots succeed — Sharing Debugger then shows 403 and
 * falls back to `og:title` = the hostname instead of real Open Graph tags.
 *
 * @see https://github.com/vercel/next.js/issues/44470
 */
export function shouldStripRangeForSocialCrawler(
  userAgent: string | null,
  hasRangeHeader: boolean,
): boolean {
  return hasRangeHeader && isSocialPreviewCrawler(userAgent);
}

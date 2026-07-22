import { getPodcastEpisodes } from "@/lib/content-data";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { absoluteUrl } from "@/lib/seo/json-ld";
import { formatWhatsNewEventDate } from "@/lib/whats-new/groupByMonth";
import { buildPublicWhatsNewEvents } from "@/lib/whats-new/publicEvents";
import { siteConfig } from "@/lib/site-config";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toRfc822(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return new Date().toUTCString();
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))).toUTCString();
}

export async function GET() {
  const [podcastEpisodes, graph] = await Promise.all([getPodcastEpisodes(), getSemanticGraph()]);
  const events = buildPublicWhatsNewEvents({
    podcastEpisodes,
    changeEvents: graph.changeEvents,
  });
  const feedUrl = absoluteUrl("/whats-new/feed.xml");
  const pageUrl = absoluteUrl("/whats-new");

  const items = events
    .map((event) => {
      const link = event.href.startsWith("http") ? event.href : absoluteUrl(event.href);
      return `    <item>
      <title>${escapeXml(event.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(event.id)}</guid>
      <pubDate>${toRfc822(event.date)}</pubDate>
      <description>${escapeXml(`${formatWhatsNewEventDate(event.date)} — ${event.summary}`)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteConfig.name} — What’s New`)}</title>
    <link>${escapeXml(pageUrl)}</link>
    <description>${escapeXml("Meaningful publications, revisions, podcast episodes, and site features from After Certainty.")}</description>
    <language>en-us</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

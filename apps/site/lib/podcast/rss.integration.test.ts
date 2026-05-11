import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchPodcastFeedUncached, PODCAST_RSS_REVALIDATE_SECONDS } from "@/lib/podcast/rss";

/** Minimal valid RSS 2.0 for rss-parser + our normalizer */
const FIXTURE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Test Channel</title>
    <item>
      <title>Integration Episode</title>
      <pubDate>Mon, 15 Jan 2024 12:00:00 GMT</pubDate>
      <enclosure url="https://cdn.example.com/e1.mp3" type="audio/mpeg" length="1000"/>
      <description><![CDATA[<p>Episode <strong>summary</strong> here.</p>]]></description>
    </item>
  </channel>
</rss>
`;

describe("RSS pipeline (fetch + parse + normalize)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let prevRssUrl: string | undefined;

  beforeEach(() => {
    prevRssUrl = process.env.PODCAST_RSS_URL;
    process.env.PODCAST_RSS_URL = "https://fixture.example/podcast.xml";
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.PODCAST_RSS_URL = prevRssUrl;
  });

  it("returns ok with normalized episodes when fetch returns valid XML", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(FIXTURE_RSS, {
        status: 200,
        headers: { "Content-Type": "application/rss+xml" },
      }),
    );

    const result = await fetchPodcastFeedUncached();

    expect(result.ok).toBe(true);
    expect(result.episodes).toHaveLength(1);
    expect(result.episodes[0]!.title).toBe("Integration Episode");
    expect(result.episodes[0]!.description).toContain("summary");
    expect(result.episodes[0]!.audioUrl).toBe("https://cdn.example.com/e1.mp3");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://fixture.example/podcast.xml",
      expect.objectContaining({
        next: { revalidate: PODCAST_RSS_REVALIDATE_SECONDS },
        headers: expect.objectContaining({
          Accept: expect.stringContaining("rss+xml"),
        }),
      }),
    );
  });

  it("falls back to JSON episodes when HTTP status is not ok", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 503 }));

    const result = await fetchPodcastFeedUncached();

    expect(result.ok).toBe(false);
    expect(result.episodes.length).toBeGreaterThan(0);
    expect(result.message).toBe("Podcast episodes are temporarily unavailable.");
  });

  it("falls back when the feed has zero items", async () => {
    const emptyChannel = `<?xml version="1.0"?><rss version="2.0"><channel><title>Empty</title></channel></rss>`;
    fetchMock.mockResolvedValueOnce(new Response(emptyChannel, { status: 200 }));

    const result = await fetchPodcastFeedUncached();

    expect(result.ok).toBe(false);
    expect(result.episodes.length).toBeGreaterThan(0);
  });
});

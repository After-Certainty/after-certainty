/**
 * Server-side RSS ingestion for After Certainty.
 *
 * ISR: successful `fetch` uses `next: { revalidate: PODCAST_RSS_REVALIDATE_SECONDS }` (1 hour).
 * Route-level `export const revalidate` was omitted — Turbopack flagged invalid segment config when combined with this route; caching is driven by `fetch` only.
 */
import Parser from "rss-parser";
import { cache } from "react";
import fallbackData from "@/data/podcast-episodes.json";
import type { PodcastEpisode } from "@/types/content";
import {
  episodeSortKey,
  mapFeedItemsToEpisodes,
  type RssItem,
} from "@/lib/podcast/normalize";
import type { PodcastFeedResultWithFallback } from "@/lib/podcast/types";
import { resolvePodcastRssUrl } from "@/lib/site-config";

const parser = new Parser();

export const PODCAST_RSS_REVALIDATE_SECONDS = 3600;

function sortRssItemsNewestFirst(items: RssItem[]): RssItem[] {
  return [...items].sort((a, b) => episodeSortKey(b) - episodeSortKey(a));
}

function sortEpisodesNewestFirst(episodes: PodcastEpisode[]): PodcastEpisode[] {
  return [...episodes].sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0;
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return a.publishedAt < b.publishedAt ? 1 : -1;
  });
}

function loadFallbackEpisodes(): PodcastEpisode[] {
  const raw = fallbackData.episodes as unknown as PodcastEpisode[];
  return sortEpisodesNewestFirst(raw);
}

/**
 * Full fetch → parse → normalize pipeline without React `cache`.
 * Used by `getPodcastFeed` (cached per request) and integration tests with mocked `fetch`.
 */
export async function fetchPodcastFeedUncached(): Promise<PodcastFeedResultWithFallback> {
  const fetchedAt = new Date().toISOString();
  const rssUrl = resolvePodcastRssUrl();

  try {
    const res = await fetch(rssUrl, {
      next: { revalidate: PODCAST_RSS_REVALIDATE_SECONDS },
      headers: {
        Accept: "application/rss+xml, application/xml, application/atom+xml, text/xml, */*",
      },
    });

    if (!res.ok) {
      throw new Error(`RSS HTTP ${res.status}`);
    }

    const xml = await res.text();
    const feed = await parser.parseString(xml);
    const rawItems = (feed.items ?? []) as RssItem[];
    const sortedItems = sortRssItemsNewestFirst(rawItems);

    if (sortedItems.length === 0) {
      throw new Error("RSS feed returned no items");
    }

    const episodes = sortEpisodesNewestFirst(mapFeedItemsToEpisodes(sortedItems));

    return {
      ok: true,
      episodes,
      fetchedAt,
    };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[podcast/rss] Feed unavailable, using fallback:", err);
    }

    return {
      ok: false,
      episodes: loadFallbackEpisodes(),
      fetchedAt,
      message: "Podcast episodes are temporarily unavailable.",
    };
  }
}

const cachedFeed = cache(fetchPodcastFeedUncached);

/**
 * Full feed state for `/podcast` — includes success flag and graceful fallback copy.
 * ISR: `revalidate` 1h on successful fetch (see `PODCAST_RSS_REVALIDATE_SECONDS`).
 */
export async function getPodcastFeed(): Promise<PodcastFeedResultWithFallback> {
  return cachedFeed();
}

/**
 * Episodes list for site-wide use (home, start, etc.).
 * Same cache as `getPodcastFeed` — always returns at least fallback JSON when RSS fails.
 */
export async function getPodcastEpisodesFromRss(): Promise<PodcastEpisode[]> {
  const result = await cachedFeed();
  return result.episodes;
}


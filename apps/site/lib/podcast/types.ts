import type { PodcastEpisode } from "@/types/content";

/** Result of server-side RSS ingestion — episodes always present (fallback when needed). */
export type PodcastFeedResult = {
  ok: true;
  episodes: PodcastEpisode[];
  fetchedAt: string;
};

export type PodcastFeedResultWithFallback = PodcastFeedResult | PodcastFeedFallback;

export type PodcastFeedFallback = {
  ok: false;
  episodes: PodcastEpisode[];
  fetchedAt: string;
  /** User-facing hint — never stack traces */
  message: string;
};

import { getPodcastEpisodesFromRss } from "@/lib/podcast/rss";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { enrichTrail, enrichTrails } from "@/lib/trails/enrichTrails";
import {
  getBrowsableTrails,
  getFeaturedTrails,
  getPublishedTrails,
  getTrailBySlug,
  getUpcomingTrails,
} from "@/lib/trails/loadTrails";
import type { EnrichedTrail } from "@/types/trails";

export async function getEnrichedPublishedTrails(): Promise<EnrichedTrail[]> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodesFromRss(),
  ]);
  return enrichTrails(getPublishedTrails(graph), graph, podcastEpisodes);
}

export async function getEnrichedUpcomingTrails(): Promise<EnrichedTrail[]> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodesFromRss(),
  ]);
  return enrichTrails(getUpcomingTrails(graph), graph, podcastEpisodes);
}

export async function getEnrichedFeaturedTrails(limit = 3): Promise<EnrichedTrail[]> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodesFromRss(),
  ]);
  return enrichTrails(getFeaturedTrails(limit, graph), graph, podcastEpisodes);
}

export async function getEnrichedTrailBySlug(slug: string): Promise<EnrichedTrail | undefined> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodesFromRss(),
  ]);
  const trail = getTrailBySlug(slug, graph);
  if (!trail || (trail.status !== "published" && trail.status !== "upcoming")) {
    return undefined;
  }

  return enrichTrail(trail, graph, podcastEpisodes);
}

export async function getEnrichedBrowsableTrails(): Promise<EnrichedTrail[]> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodesFromRss(),
  ]);
  return enrichTrails(getBrowsableTrails(graph), graph, podcastEpisodes);
}

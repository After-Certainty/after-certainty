import { getPodcastEpisodes } from "@/lib/content-data";
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
  const [{ graph, catalogBooks }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodes(),
  ]);
  return enrichTrails(getPublishedTrails(), graph, catalogBooks, podcastEpisodes);
}

export async function getEnrichedUpcomingTrails(): Promise<EnrichedTrail[]> {
  const [{ graph, catalogBooks }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodes(),
  ]);
  return enrichTrails(getUpcomingTrails(), graph, catalogBooks, podcastEpisodes);
}

export async function getEnrichedFeaturedTrails(limit = 3): Promise<EnrichedTrail[]> {
  const [{ graph, catalogBooks }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodes(),
  ]);
  return enrichTrails(getFeaturedTrails(limit), graph, catalogBooks, podcastEpisodes);
}

export async function getEnrichedTrailBySlug(slug: string): Promise<EnrichedTrail | undefined> {
  const trail = getTrailBySlug(slug);
  if (!trail || (trail.status !== "published" && trail.status !== "upcoming")) {
    return undefined;
  }

  const [{ graph, catalogBooks }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodes(),
  ]);
  return enrichTrail(trail, graph, catalogBooks, podcastEpisodes);
}

export async function getEnrichedBrowsableTrails(): Promise<EnrichedTrail[]> {
  const [{ graph, catalogBooks }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodes(),
  ]);
  return enrichTrails(getBrowsableTrails(), graph, catalogBooks, podcastEpisodes);
}

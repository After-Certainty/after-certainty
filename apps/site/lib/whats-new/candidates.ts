import type { PodcastEpisode } from "@/types/content";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

/**
 * Narrow auto-candidates for the hybrid What’s New model.
 * Podcast episodes become candidates; book_revised is never generated here.
 * Candidates still require `published: true` (or editorial confirm) before the public feed.
 */
export function buildPodcastWhatsNewCandidates(
  episodes: readonly PodcastEpisode[],
  existing: readonly WhatsNewEvent[],
): WhatsNewEvent[] {
  const covered = new Set(
    existing.filter((e) => e.type === "podcast_episode" && e.entityId).map((e) => e.entityId!),
  );

  const candidates: WhatsNewEvent[] = [];
  for (const episode of episodes) {
    if (covered.has(episode.id)) continue;
    if (!episode.publishedAt?.trim()) continue;

    const date = episode.publishedAt.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    candidates.push({
      id: `event-podcast-${episode.id}`,
      type: "podcast_episode",
      title: `Podcast: ${episode.title}`,
      summary:
        episode.description?.trim().slice(0, 480) ||
        `A new After Certainty podcast episode: ${episode.title}.`,
      date,
      entityType: "podcast",
      entityId: episode.id,
      href: "/podcast",
      image: episode.image,
      featured: false,
      significance: "standard",
      visibility: "public",
      source: "generated_candidate",
      // Phase D: candidates default unpublished until editorial confirm or Phase E policy.
      published: false,
    });
  }

  return candidates;
}

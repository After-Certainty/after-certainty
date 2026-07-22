import { buildPodcastWhatsNewCandidates } from "@/lib/whats-new/candidates";
import { getWhatsNewManifest } from "@/lib/whats-new/loadWhatsNew";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";
import type { PodcastEpisode } from "@/types/content";

export type BuildPublicWhatsNewEventsInput = {
  authored?: readonly WhatsNewEvent[];
  podcastEpisodes?: readonly PodcastEpisode[];
  /** When true, include generated podcast candidates that set published:true (none by default). */
  includePublishedCandidates?: boolean;
};

/**
 * Public chronological feed events for Phase E.
 * Authored published+public events only in Phase D defaults; candidates stay gated.
 */
export function buildPublicWhatsNewEvents(
  input: BuildPublicWhatsNewEventsInput = {},
): WhatsNewEvent[] {
  const manifest = getWhatsNewManifest();
  const authored = input.authored ?? manifest.events;
  const candidates = input.podcastEpisodes
    ? buildPodcastWhatsNewCandidates(input.podcastEpisodes, authored)
    : [];

  const combined = [...authored, ...candidates];
  const launchFrom = manifest.launchFrom;

  return combined
    .filter((event) => event.visibility === "public" && event.published)
    .filter((event) => !launchFrom || event.date >= launchFrom)
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.id.localeCompare(b.id);
    });
}

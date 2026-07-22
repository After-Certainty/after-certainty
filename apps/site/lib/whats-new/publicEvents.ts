import fallbackSemantic from "@/data/semantic-manifest.json";
import { changeEventsToWhatsNewEvents } from "@/lib/graph/discovery";
import { validateSemanticGraph } from "@/lib/graph/validate";
import { buildPodcastWhatsNewCandidates } from "@/lib/whats-new/candidates";
import { getSiteWhatsNewManifest } from "@/lib/whats-new/loadWhatsNew";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";
import type { PodcastEpisode } from "@/types/content";
import type { ChangeEvent } from "@/types/semanticGraph";

export type BuildPublicWhatsNewEventsInput = {
  authored?: readonly WhatsNewEvent[];
  /** Corpus change events from semantic-manifest (book_published, etc.). */
  changeEvents?: readonly ChangeEvent[];
  podcastEpisodes?: readonly PodcastEpisode[];
  /** When true, include generated podcast candidates that set published:true (none by default). */
  includePublishedCandidates?: boolean;
};

function bundledChangeEvents(): ChangeEvent[] {
  const result = validateSemanticGraph(fallbackSemantic as unknown);
  if (!result.success) return [];
  return result.data.changeEvents ?? [];
}

/**
 * Public chronological feed events.
 * Merges corpus changeEvents with site-owned podcast/site_feature rows.
 */
export function buildPublicWhatsNewEvents(
  input: BuildPublicWhatsNewEventsInput = {},
): WhatsNewEvent[] {
  const site = getSiteWhatsNewManifest();
  const corpusEvents = changeEventsToWhatsNewEvents(input.changeEvents ?? bundledChangeEvents());
  const authored = input.authored ?? [...corpusEvents, ...site.events];
  const candidates = input.podcastEpisodes
    ? buildPodcastWhatsNewCandidates(input.podcastEpisodes, authored)
    : [];

  const combined = [...authored, ...candidates];
  const launchFrom = site.launchFrom;

  return combined
    .filter((event) => event.visibility === "public" && event.published)
    .filter((event) => !launchFrom || event.date >= launchFrom)
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.id.localeCompare(b.id);
    });
}

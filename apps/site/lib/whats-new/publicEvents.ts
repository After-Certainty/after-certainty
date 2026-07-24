import { changeEventsToWhatsNewEvents } from "@/lib/graph/discovery";
import { loadInstalledSemanticGraphSync } from "@/lib/graph/installed-manifest";
import { buildPodcastWhatsNewCandidates } from "@/lib/whats-new/candidates";
import { getSiteWhatsNewManifest } from "@/lib/whats-new/loadWhatsNew";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";
import type { PodcastEpisode } from "@/types/content";
import type { Book, ChangeEvent } from "@/types/semanticGraph";

export type BuildPublicWhatsNewEventsInput = {
  authored?: readonly WhatsNewEvent[];
  /** Corpus change events from semantic-manifest (book_published, etc.). */
  changeEvents?: readonly ChangeEvent[];
  books?: readonly Book[];
  podcastEpisodes?: readonly PodcastEpisode[];
  /** When true, include generated podcast candidates that set published:true (none by default). */
  includePublishedCandidates?: boolean;
};

function installedGraphSlice(): { changeEvents: ChangeEvent[]; books: Book[] } {
  try {
    const graph = loadInstalledSemanticGraphSync();
    return {
      changeEvents: graph.changeEvents ?? [],
      books: graph.books ?? [],
    };
  } catch {
    return { changeEvents: [], books: [] };
  }
}

/**
 * Public chronological feed events.
 * Merges corpus changeEvents with site-owned podcast/site_feature rows.
 */
export function buildPublicWhatsNewEvents(
  input: BuildPublicWhatsNewEventsInput = {},
): WhatsNewEvent[] {
  const site = getSiteWhatsNewManifest();
  const installed = installedGraphSlice();
  const corpusEvents = changeEventsToWhatsNewEvents(
    input.changeEvents ?? installed.changeEvents,
    input.books ?? installed.books,
  );
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

import { TrackedLink } from "@/components/analytics/tracked-link";
import { WhatsNewEventCard } from "@/components/whats-new/whats-new-event-card";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { getPodcastEpisodes } from "@/lib/content-data";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { buildPublicWhatsNewEvents } from "@/lib/whats-new/publicEvents";

const PREVIEW_LIMIT = 4;

/**
 * Homepage “Latest from After Certainty” — replaces the single featured book + episode block.
 */
export async function WhatsNewHomePreview() {
  const [podcastEpisodes, graph] = await Promise.all([getPodcastEpisodes(), getSemanticGraph()]);
  const events = buildPublicWhatsNewEvents({
    podcastEpisodes,
    changeEvents: graph.changeEvents,
  }).slice(0, PREVIEW_LIMIT);

  if (events.length === 0) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-accent">Latest from After Certainty</p>
      <div className="mt-2 divide-y divide-border/30">
        {events.map((event) => (
          <WhatsNewEventCard key={event.id} event={event} location="home" headingLevel="h3" />
        ))}
      </div>
      <TrackedLink
        href="/whats-new"
        className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        analytics={{
          event: AnalyticsEvents.whatsNewHomeSelect,
          params: { location: "home_preview_more" },
        }}
      >
        Browse What’s New →
      </TrackedLink>
    </div>
  );
}

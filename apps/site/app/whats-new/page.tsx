import type { Metadata } from "next";

import { WhatsNewPageContent } from "@/components/whats-new/whats-new-page-content";
import { getPodcastEpisodes } from "@/lib/content-data";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { createPageMetadata } from "@/lib/metadata";
import { buildPublicWhatsNewEvents } from "@/lib/whats-new/publicEvents";
import { parseWhatsNewFilter } from "@/lib/whats-new/url-state";

type PageProps = {
  searchParams: Promise<{ type?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const filter = parseWhatsNewFilter(params.type);
  const base = createPageMetadata({
    title: "What’s New",
    description:
      "Meaningful publications, revisions, podcast episodes, and site features from the After Certainty project.",
  });

  return {
    ...base,
    alternates: {
      ...base.alternates,
      canonical: "/whats-new",
      types: {
        ...(typeof base.alternates?.types === "object" ? base.alternates.types : {}),
        "application/rss+xml": "/whats-new/feed.xml",
      },
    },
    // Filtered views share the same canonical URL — avoid indexing filter combinations.
    robots: filter === "all" ? base.robots : { index: false, follow: true },
  };
}

export default async function WhatsNewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = parseWhatsNewFilter(params.type);
  const [podcastEpisodes, graph] = await Promise.all([getPodcastEpisodes(), getSemanticGraph()]);
  const events = buildPublicWhatsNewEvents({
    podcastEpisodes,
    changeEvents: graph.changeEvents,
  });

  return <WhatsNewPageContent filter={filter} events={events} />;
}

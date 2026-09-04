import type { Metadata } from "next";

import { ListenHero } from "@/components/listen/listen-hero";
import { ListenLibrary, type ListenLibraryItem } from "@/components/listen/listen-library";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { exploreIndexCountLabel } from "@/lib/explore/explore-index-browse";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";
import { orderListenSongs } from "@/lib/songs/listen-order";

export const metadata: Metadata = createPageMetadata({
  title: "Listen",
  description:
    "Listen to songs from After Certainty — ideas from the project translated into jazz, folk, soul, electronic music, psychedelia, and other forms.",
  alternates: { canonical: "/listen" },
});

export default async function ListenPage() {
  const { graph } = await getExploreSemanticGraph();
  const ordered = orderListenSongs(graph);

  const items: ListenLibraryItem[] = ordered.map((entry) => ({
    slug: entry.song.slug,
    title: entry.song.title,
    shortDescription: entry.song.shortDescription,
    recordingExternalId: entry.recordingExternalId,
    ...(entry.versionTitle ? { versionTitle: entry.versionTitle } : {}),
  }));

  return (
    <article>
      <ListenHero countLabel={exploreIndexCountLabel(items.length, "song")} />
      <Section atmosphere="transition" className="border-t border-border/25 py-8 md:py-16">
        <Container className="max-w-6xl">
          {items.length === 0 ? (
            <p className="text-muted">No playable songs are published in the manifest yet.</p>
          ) : (
            <ListenLibrary items={items} />
          )}
        </Container>
      </Section>
    </article>
  );
}

import type { Metadata } from "next";
import { exploreIndexCatalogGridClassName } from "@/components/explore/explore-catalog-card";
import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { SongCard } from "@/components/explore/song-card";
import { Section } from "@/components/ui/section";
import { exploreIndexCountLabel } from "@/lib/explore/explore-index-browse";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Songs",
  description:
    "Songs in the After Certainty semantic graph — compositions that carry concepts and patterns through lyric and recording.",
});

export default async function ExploreSongsIndexPage() {
  const { graph } = await getExploreSemanticGraph();
  const songs = [...(graph.songs ?? [])].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  );

  return (
    <article>
      <ExploreIndexHero
        eyebrow="Heard terrain"
        title="Songs"
        headingId="explore-songs-heading"
        density="editorial"
        countLabel={exploreIndexCountLabel(songs.length, "song")}
        lede="Compositions that carry the same questions in a different register — lyrics, recordings, and the patterns they keep in play."
      />
      <Section atmosphere="transition" className="border-t border-border/25 py-6 md:py-16">
        {songs.length === 0 ? (
          <p className="text-muted">No songs are published in the manifest yet.</p>
        ) : (
          <div className={exploreIndexCatalogGridClassName}>
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </Section>
    </article>
  );
}

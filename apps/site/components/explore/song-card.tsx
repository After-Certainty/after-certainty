import type { ManifestSong } from "@/types/semanticGraph";
import {
  ExploreCatalogCard,
  type ExploreCatalogCardLayout,
} from "@/components/explore/explore-catalog-card";
import { explorePaths } from "@/lib/graph/explorePaths";

type SongCardProps = {
  song: ManifestSong;
  layout?: ExploreCatalogCardLayout;
};

export function SongCard({ song, layout = "responsive" }: SongCardProps) {
  return (
    <ExploreCatalogCard
      href={`${explorePaths.songs}/${song.slug}`}
      eyebrow="Song"
      title={song.title}
      blurb={song.shortDescription}
      ctaLabel="View Song →"
      layout={layout}
    />
  );
}

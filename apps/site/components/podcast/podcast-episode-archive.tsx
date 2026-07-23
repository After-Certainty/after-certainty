import type { PodcastEpisode } from "@/types/content";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PodcastEpisodeCard } from "@/components/podcast/podcast-episode-card";

export function PodcastEpisodeArchive({ episodes }: { episodes: PodcastEpisode[] }) {
  if (episodes.length === 0) {
    return (
      <Section atmosphere="none" className="border-b border-border/35 py-16 md:py-20">
        <Container className="max-w-2xl">
          <p className="text-sm leading-relaxed text-muted">
            Additional episodes will appear here as they are published to the feed.
          </p>
        </Container>
      </Section>
    );
  }

  return (
    <Section atmosphere="none" className="border-b border-border/35 py-16 md:py-24">
      <Container className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.32em] text-muted">Archive</p>
        <h2 className="mt-5 font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">All episodes</h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
          Newest first — descriptions are shortened for clarity; open an episode for the full listening context on your
          preferred platform.
        </p>
        <div className="mt-12 border-t border-border/30">
          {episodes.map((episode) => (
            <PodcastEpisodeCard key={episode.id} episode={episode} variant="list" />
          ))}
        </div>
      </Container>
    </Section>
  );
}

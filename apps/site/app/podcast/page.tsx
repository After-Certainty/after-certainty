import type { Metadata } from "next";
import { PodcastEpisodeArchive } from "@/components/podcast/podcast-episode-archive";
import { PodcastEpisodeCard } from "@/components/podcast/podcast-episode-card";
import { PodcastFeedBanner } from "@/components/podcast/podcast-feed-banner";
import { PodcastFooterCta } from "@/components/podcast/podcast-footer-cta";
import { PodcastHero } from "@/components/podcast/podcast-hero";
import { PodcastPhilosophy } from "@/components/podcast/podcast-philosophy";
import { PodcastPlatformLinks } from "@/components/podcast/podcast-platform-links";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPodcastFeed } from "@/lib/podcast/rss";
import { createPageMetadata } from "@/lib/metadata";
import { resolvePodcastPlatformLinks, resolvePodcastRssUrl } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Podcast",
  description:
    "Reflective conversations on meaning, trust, leadership, and systems — audio inquiries beyond rehearsed certainty.",
});

export default async function PodcastPage() {
  const feed = await getPodcastFeed();
  const platforms = resolvePodcastPlatformLinks();
  const rssHref = resolvePodcastRssUrl();

  const episodes = feed.episodes;
  const latest = episodes[0];
  const rest = episodes.slice(1);

  return (
    <article>
      {!feed.ok ? <PodcastFeedBanner message={feed.message} /> : null}

      <PodcastHero spotifyHref={platforms.spotify} rssHref={rssHref} />

      {latest ? (
        <Section atmosphere="none" className="py-16 md:py-24">
          <Container className="max-w-4xl">
            <PodcastEpisodeCard episode={latest} variant="featured" />
          </Container>
        </Section>
      ) : (
        <Section atmosphere="none" className="py-16 md:py-20">
          <Container className="max-w-2xl text-center">
            <p className="text-muted">No episodes are listed yet.</p>
          </Container>
        </Section>
      )}

      <PodcastEpisodeArchive episodes={rest} />

      <PodcastPhilosophy />

      <PodcastPlatformLinks links={platforms} />

      <PodcastFooterCta />
    </article>
  );
}

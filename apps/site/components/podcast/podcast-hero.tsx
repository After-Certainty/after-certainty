import Image from "next/image";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { Container } from "@/components/ui/container";

const backdropSrc = "/images/hero/hero-backdrop.png";

type PodcastHeroProps = {
  spotifyHref: string;
  rssHref: string;
};

export function PodcastHero({ spotifyHref, rssHref }: PodcastHeroProps) {
  return (
    <section className="relative min-h-[min(52vh,560px)] overflow-hidden border-b border-border/40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={backdropSrc}
          alt=""
          fill
          priority
          className="object-cover object-[center_42%] opacity-[0.55]"
          sizes="100vw"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/[0.92] via-bg/[0.72] to-bg/[0.94]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-grain bg-cover bg-center opacity-[0.032] mix-blend-soft-light md:opacity-[0.042]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-topology-fade-start bg-cover bg-left opacity-[0.045] mix-blend-soft-light md:opacity-[0.065]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-light-bloom bg-cover bg-center opacity-[0.055] mix-blend-soft-light md:opacity-[0.07]"
        aria-hidden
      />
      <div className="atm-vignette-soft pointer-events-none absolute inset-0 z-[2] opacity-[0.5] md:opacity-[0.62]" aria-hidden />

      <Container className="relative z-10 mx-auto max-w-4xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center md:max-w-3xl">
          <p className="text-xs uppercase tracking-[0.42em] text-muted">Conversations</p>
          <h1 className="mt-8 font-display text-5xl font-medium leading-[1.06] tracking-tight text-fg md:text-6xl">
            Podcast
          </h1>
          <p className="mx-auto mt-10 max-w-xl text-base leading-[1.75] text-muted md:text-lg">
            Conversations exploring meaning, trust, leadership, communication, systems, uncertainty, and the
            structures that shape human understanding.
          </p>
          <div className="mx-auto mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <TrackedLink
              href={spotifyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] min-w-[12rem] items-center justify-center border border-border/60 bg-bg-elevated/30 px-8 py-3 text-xs uppercase tracking-[0.28em] text-fg transition-colors hover:border-accent/35 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              analytics={outboundLinkAnalytics(spotifyHref, "Listen on Spotify", "podcast_hero", "spotify")}
            >
              Listen on Spotify
            </TrackedLink>
            <TrackedLink
              href={rssHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] min-w-[12rem] items-center justify-center border border-border/45 px-8 py-3 text-xs uppercase tracking-[0.28em] text-muted transition-colors hover:border-accent/30 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              analytics={outboundLinkAnalytics(rssHref, "RSS feed", "podcast_hero", "rss")}
            >
              RSS feed
            </TrackedLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

import { TrackedLink } from "@/components/analytics/tracked-link";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { PodcastPlatformLinks } from "@/lib/site-config";

function IconSpotify({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 1.5a10.5 10.5 0 100 21 10.5 10.5 0 000-21zm4.84 14.94c-.18.3-.56.4-.86.22-2.36-1.44-5.33-1.77-8.83-.97-.34.08-.68-.13-.76-.46-.08-.34.13-.68.46-.76 3.72-.84 6.9-.48 9.48 1.08.3.18.4.56.22.86l-.07.03zm1.23-2.74c-.22.36-.7.48-1.06.26a13.4 13.4 0 00-9.52-1.18c-.42.1-.84-.14-.94-.56-.1-.42.14-.84.56-.94 3.46-.84 7.38-.48 10.86 1.44.36.22.48.7.26 1.06l-.16-.08zm.14-2.85c-2.67-1.58-7.08-1.72-9.65-.94-.5.14-1.02-.14-1.16-.64-.14-.5.14-1.02.64-1.16 2.91-.84 7.85-.68 10.96 1.18.46.26.62.86.36 1.32-.26.46-.86.62-1.32.36l-.03-.12z" />
    </svg>
  );
}

function IconRss({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4a12 12 0 0112 12h-3a9 9 0 00-9-9V4zm0 6a6 6 0 016 6H7a3 3 0 00-3-3v-3zm2 5a2 2 0 110 4 2 2 0 010-4z" />
    </svg>
  );
}

function IconApple({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.36 12.1c.02-2.03 1.66-3.02 1.74-3.08-1.05-1.44-2.67-1.63-3.24-1.65-1.37-.14-2.68.8-3.38.8-.7 0-1.78-.78-2.93-.76-1.5.02-2.9.87-3.68 2.22-1.57 2.72-.4 6.76 1.13 8.97.75 1.03 1.65 2.2 2.82 2.16 1.13-.05 1.56-.73 2.92-.73 1.37 0 1.76.73 2.94.7 1.22-.02 1.99-1.09 2.73-2.13.86-1.15 1.21-2.27 1.23-2.33-.03-.01-2.35-.89-2.37-3.52zm-2.22-6.45c.62-.74 1.04-1.76.93-2.78-.9.04-2 .6-2.65 1.34-.57.63-1.08 1.65-.95 2.63 1.01.08 2.04-.5 2.67-1.19z" />
    </svg>
  );
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.8 8.2s-.2-1.5-.8-2.2c-.8-.8-1.7-.8-2.1-.9C16 4.7 12 4.7 12 4.7s-4 0-6.9.4c-.4 0-1.3.1-2.1.9-.6.7-.8 2.2-.8 2.2S2 9.9 2 11.6v1.7c0 1.7.2 3.4.2 3.4s.2 1.5.8 2.2c.8.8 1.9.8 2.4.9 1.8.2 7.6.2 7.6.2s4 0 6.9-.4c.4-.1 1.3-.1 2.1-.9.6-.7.8-2.2.8-2.2s.2-1.7.2-3.4v-1.7c0-1.7-.2-3.4-.2-3.4zM10 14.7V8.9l5.2 2.9-5.2 2.9z" />
    </svg>
  );
}

function IconGithub({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.18 3.36 9.57 8.03 11.12.59.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.26.71-3.95-1.57-3.95-1.57-.53-1.35-1.3-1.71-1.3-1.71-1.06-.73.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.76.41-1.27.74-1.56-2.6-.3-5.33-1.3-5.33-5.77 0-1.28.46-2.32 1.2-3.14-.12-.29-.52-1.47.12-3.06 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.28-1.23 3.28-1.23.64 1.59.24 2.77.12 3.06.76.82 1.19 1.86 1.19 3.14 0 4.49-2.74 5.46-5.35 5.75.42.36.8 1.08.8 2.18 0 1.57-.02 2.84-.02 3.23 0 .31.21.68.8.56A11.52 11.52 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

type RowProps = {
  icon: React.ReactNode;
  label: string;
  href?: string;
  placeholder?: boolean;
  platform?: string;
};

function PlatformRow({ icon, label, href, placeholder, platform }: RowProps) {
  const inner = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 text-muted transition-colors group-hover:border-accent/35 group-hover:text-accent">
        {icon}
      </span>
      <span className="text-sm tracking-tight text-fg">{label}</span>
    </>
  );

  if (placeholder || !href) {
    return (
      <div className="flex items-center gap-4 rounded-md border border-border/25 bg-transparent px-4 py-3 text-muted/75">
        {inner}
        <span className="ml-auto text-xs uppercase tracking-[0.18em] text-muted/55">Soon</span>
      </div>
    );
  }

  return (
    <TrackedLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-md border border-border/40 px-4 py-3 transition-colors hover:border-accent/30 hover:bg-bg-elevated/20"
      analytics={outboundLinkAnalytics(href, label, "podcast_platforms", platform)}
    >
      {inner}
      <span className="ml-auto text-xs uppercase tracking-[0.2em] text-muted opacity-0 transition-opacity group-hover:opacity-100">
        →
      </span>
    </TrackedLink>
  );
}

export function PodcastPlatformLinks({ links }: { links: PodcastPlatformLinks }) {
  const applePlaceholder = !links.apple;

  return (
    <Section atmosphere="transition" className="border-b border-border/35 py-20 md:py-28">
      <Container>
        <p className="text-xs uppercase tracking-[0.32em] text-muted">Listen elsewhere</p>
        <h2 className="mt-5 font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">Platforms</h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
          Subscribe in the app you already use — or pull the open RSS feed into any reader.
        </p>
        <div className="mx-auto mt-12 grid max-w-lg gap-3">
          <PlatformRow icon={<IconSpotify className="h-4 w-4" />} label="Spotify" href={links.spotify} platform="spotify" />
          <PlatformRow
            icon={<IconApple className="h-4 w-4" />}
            label="Apple Podcasts"
            href={applePlaceholder ? undefined : links.apple}
            placeholder={applePlaceholder}
            platform="apple"
          />
          <PlatformRow icon={<IconRss className="h-4 w-4" />} label="RSS" href={links.rss} platform="rss" />
          <PlatformRow
            icon={<IconYoutube className="h-4 w-4" />}
            label="YouTube"
            href={links.youtube || undefined}
            placeholder={!links.youtube}
            platform="youtube"
          />
          <PlatformRow
            icon={<IconGithub className="h-4 w-4" />}
            label="GitHub discussions"
            href={links.githubDiscussions}
            platform="github"
          />
        </div>
      </Container>
    </Section>
  );
}

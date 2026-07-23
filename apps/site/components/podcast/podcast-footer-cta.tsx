import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { resolvePodcastPlatformLinks } from "@/lib/site-config";

export function PodcastFooterCta() {
  const { githubDiscussions } = resolvePodcastPlatformLinks();

  return (
    <Section atmosphere="none" className="bg-bg-elevated/[0.04] py-20 md:py-28">
      <Container className="max-w-2xl text-center">
        <p className="text-base leading-[1.85] text-muted md:text-[17px]">
          Conversations continue through listening, reflection, disagreement, and participation.
        </p>
        <div className="mx-auto mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link
            href="/explore/books"
            className="inline-flex min-h-[44px] min-w-[11rem] items-center justify-center border border-border/55 px-8 py-3 text-xs uppercase tracking-[0.26em] text-fg transition-colors hover:border-accent/35 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Explore the books
          </Link>
          <TrackedLink
            href={githubDiscussions}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] min-w-[11rem] items-center justify-center border border-accent/35 bg-accent-soft px-8 py-3 text-xs uppercase tracking-[0.26em] text-accent transition-colors hover:bg-accent/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            analytics={outboundLinkAnalytics(
              githubDiscussions,
              "Join the conversation",
              "podcast_footer",
              "github",
            )}
          >
            Join the conversation
          </TrackedLink>
        </div>
      </Container>
    </Section>
  );
}

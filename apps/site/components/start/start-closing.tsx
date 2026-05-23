import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { siteConfig } from "@/lib/site-config";

export function StartClosing() {
  return (
    <Section atmosphere="transition" className="relative bg-bg py-28 md:py-36">
      <Container className="relative z-10 mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-14 h-px max-w-sm bg-gradient-to-r from-transparent via-border/80 to-transparent" aria-hidden />
        <p className="font-display text-2xl leading-snug text-fg md:text-3xl md:leading-snug">
          Conversations continue through participation.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <ButtonLink href="/" variant="primary">
            Explore the project
          </ButtonLink>
          <ButtonLink
            href={siteConfig.githubUrl}
            variant="ghost"
            target="_blank"
            rel="noopener noreferrer"
            analytics={outboundLinkAnalytics(
              siteConfig.githubUrl,
              "Contribute on GitHub",
              "start_closing",
              "github",
            )}
          >
            Contribute on GitHub
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}

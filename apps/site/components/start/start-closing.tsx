import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { siteConfig } from "@/lib/site-config";

export function StartClosing() {
  return (
    <section className="atm-section atm-section--transition relative bg-bg py-12 md:py-36">
      <Container className="relative z-10 mx-auto max-w-2xl text-center">
        <div
          className="mx-auto mb-6 h-px max-w-sm bg-gradient-to-r from-transparent via-border/80 to-transparent md:mb-14"
          aria-hidden
        />
        <p className="font-display text-xl leading-snug text-fg md:text-3xl md:leading-snug">
          Conversations continue through participation.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6 md:mt-12 md:gap-6">
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
    </section>
  );
}

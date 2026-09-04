import { AtmosphericSection } from "@/components/collaborators/atmospheric-section";
import { CTAButton } from "@/components/collaborators/cta-button";
import { Container } from "@/components/ui/container";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { siteConfig } from "@/lib/site-config";

/**
 * How the work is published and opened to participation — secondary to the content formats above.
 */
export function AboutPublishing() {
  return (
    <AtmosphericSection
      variant="subtle"
      as="section"
      id="how-the-project-works"
      className="border-t border-border/25"
    >
      <Container className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight text-fg md:text-4xl">
            How the Project Works
          </h2>
          <div className="mt-8 space-y-5 text-[17px] leading-[1.75] text-muted md:text-lg">
            <p>
              Books and essays here are treated less as finished products and more as durable places
              for conversation—work that can be read, extended, and revised over time.
            </p>
            <p>
              The project is published openly under{" "}
              <a className="text-accent underline-offset-4 hover:underline" href={siteConfig.license.url}>
                Creative Commons ({siteConfig.license.name})
              </a>{" "}
              licensing. A public GitHub repository holds manuscripts, metadata, and publishing
              pipelines so revision history stays visible and collaboration can happen in the open.
            </p>
            <p>
              Participation is welcome: critique, extension, pattern work, and conversation. The
              aim is a shared process, not a closed product.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <CTAButton
              href={siteConfig.githubUrl}
              variant="primary"
              target="_blank"
              rel="noreferrer"
              analytics={outboundLinkAnalytics(siteConfig.githubUrl, "View on GitHub", "about_publishing", "github")}
            >
              View on GitHub
            </CTAButton>
            <CTAButton href="/collaborators" variant="secondary">
              How collaboration works
            </CTAButton>
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted/90">
            The repository remains public; revision history carries part of the argument. Nothing
            here needs to read as performance—only as process made visible.
          </p>
        </div>
      </Container>
    </AtmosphericSection>
  );
}

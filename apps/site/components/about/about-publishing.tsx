import { AtmosphericSection } from "@/components/collaborators/atmospheric-section";
import { CTAButton } from "@/components/collaborators/cta-button";
import { Container } from "@/components/ui/container";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { siteConfig } from "@/lib/site-config";

export function AboutPublishing() {
  return (
    <AtmosphericSection variant="subtle" as="section" className="border-t border-border/25">
      <Container className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight text-fg md:text-4xl">Open Publishing</h2>
          <div className="mt-10 space-y-6 text-[17px] leading-[1.75] text-muted md:text-lg">
            <p>
              The project intentionally treats books and essays less as finished products and more as durable conversation
              spaces.
            </p>
            <p>
              Works are published openly using{" "}
              <a className="text-accent underline-offset-4 hover:underline" href={siteConfig.license.url}>
                Creative Commons ({siteConfig.license.name})
              </a>{" "}
              licensing and GitHub-based workflows to encourage extension, reinterpretation, critique, and collaboration over
              time.
            </p>
          </div>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
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
            Repositories remain public; revision history carries part of the argument. Nothing here needs to read as
            performance—only as process made visible.
          </p>
        </div>
      </Container>
    </AtmosphericSection>
  );
}

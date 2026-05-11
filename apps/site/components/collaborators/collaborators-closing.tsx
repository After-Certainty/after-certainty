import { AtmosphericSection } from "@/components/collaborators/atmospheric-section";
import { Container } from "@/components/ui/container";
import { CTAButton } from "@/components/collaborators/cta-button";
import { siteConfig } from "@/lib/site-config";

export function CollaboratorsClosing() {
  return (
    <AtmosphericSection variant="quoteBand" as="section" className="border-t border-border/30">
      <Container className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden />
          <p className="mt-10 font-display text-2xl leading-snug text-fg md:text-3xl">
            Conversations become more durable when people build them together.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <CTAButton href="/start" variant="primary">
              Explore the Project
            </CTAButton>
            <CTAButton href={siteConfig.githubUrl} variant="secondary" target="_blank" rel="noreferrer">
              Contribute on GitHub
            </CTAButton>
          </div>
        </div>
      </Container>
    </AtmosphericSection>
  );
}

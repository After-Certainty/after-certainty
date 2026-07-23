import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { CTAButton } from "@/components/collaborators/cta-button";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { resolvePodcastPlatformLinks, siteConfig } from "@/lib/site-config";

export function CollaboratorsGithub() {
  const { githubDiscussions } = resolvePodcastPlatformLinks();

  return (
    <Section atmosphere="transition" className="border-t border-border/20 py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-display text-3xl tracking-tight text-fg md:text-left md:text-4xl">
            Open Publishing Infrastructure
          </h2>
          <p className="mt-8 text-[17px] leading-[1.75] text-muted md:text-lg">
            The publishing infrastructure itself is open. Books, essays, metadata, publishing pipelines, and collaborative
            discussions are designed to remain extensible and publicly accessible.
          </p>
          <ul className="mt-10 space-y-4 text-[15px] leading-relaxed text-muted md:text-[17px]">
            <li className="border-l border-accent/25 pl-5">
              Long-form works and essays are published in the open; repositories stay public as material evolves.
            </li>
            <li className="border-l border-accent/25 pl-5">
              Content carries{" "}
              <a className="text-accent underline-offset-4 hover:underline" href={siteConfig.license.url}>
                {siteConfig.license.name}
              </a>{" "}
              licensing unless noted otherwise—inviting reuse, adaptation, and attribution.
            </li>
            <li className="border-l border-accent/25 pl-5">
              Changes land through pull requests and review; discussion threads document reasoning as texts shift.
            </li>
            <li className="border-l border-accent/25 pl-5">
              The process stays visible—an experiment in transparent publishing rather than a closed production pipeline.
            </li>
          </ul>

          <div className="mt-12 rounded-sm border border-border/35 bg-bg-elevated/[0.05] p-6 md:p-8">
            <h3 className="font-display text-lg text-fg">Where things live</h3>
            <dl className="mt-6 space-y-4 text-sm text-muted">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="shrink-0 text-xs uppercase tracking-[0.2em] text-muted/80">Repository</dt>
                <dd>
                  <TrackedLink
                    className="text-accent underline-offset-4 hover:text-fg hover:underline"
                    href={siteConfig.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    analytics={outboundLinkAnalytics(
                      siteConfig.githubUrl,
                      "Repository",
                      "collaborators_github",
                      "github",
                    )}
                  >
                    {siteConfig.githubUrl.replace(/^https:\/\//, "")}
                  </TrackedLink>
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="shrink-0 text-xs uppercase tracking-[0.2em] text-muted/80">Discussions</dt>
                <dd>
                  <TrackedLink
                    className="text-accent underline-offset-4 hover:text-fg hover:underline"
                    href={githubDiscussions}
                    target="_blank"
                    rel="noreferrer"
                    analytics={outboundLinkAnalytics(
                      githubDiscussions,
                      "GitHub Discussions",
                      "collaborators_github",
                      "github",
                    )}
                  >
                    GitHub Discussions
                  </TrackedLink>
                  <span className="mt-1 block text-[13px] text-muted/85">
                    A place for slower threads aligned with the repos—not a replacement for in-depth editorial exchange.
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <CTAButton
              href={siteConfig.githubUrl}
              variant="primary"
              target="_blank"
              rel="noreferrer"
              analytics={outboundLinkAnalytics(siteConfig.githubUrl, "Open on GitHub", "collaborators_github", "github")}
            >
              Open on GitHub
            </CTAButton>
            <CTAButton
              href={githubDiscussions}
              variant="secondary"
              target="_blank"
              rel="noreferrer"
              analytics={outboundLinkAnalytics(
                githubDiscussions,
                "Browse discussions",
                "collaborators_github",
                "github",
              )}
            >
              Browse discussions
            </CTAButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}

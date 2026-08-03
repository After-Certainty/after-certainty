import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { SiteLockup } from "@/components/branding/site-lockup";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { RssIcon } from "@/components/icons/approved";
import { SiteIcon } from "@/components/icons/site-icon";
import { GitHubSymbol } from "@/components/icons/social/GitHubSymbol";
import { LinkedInSymbol } from "@/components/icons/social/LinkedInSymbol";
import { MediumSymbol } from "@/components/icons/social/MediumSymbol";
import { YouTubeSymbol } from "@/components/icons/social/YouTubeSymbol";
import { resolvePodcastRssUrl, resolveSiteSocialLinks, siteConfig } from "@/lib/site-config";
import { Container } from "@/components/ui/container";
import { getSemanticGraph } from "@/lib/graph/manifest";

const socialIconClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-muted transition-colors duration-200 ease-out hover:bg-border/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60";

const footerNavLinkClass =
  "inline-flex min-h-11 items-center gap-1.5 text-sm text-fg transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:min-h-0";

export async function SiteFooter() {
  const semanticGraph = await getSemanticGraph();
  const podcastRssHref = resolvePodcastRssUrl();
  const manifestDate = semanticGraph.generatedAt
    ? new Date(semanticGraph.generatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const footerLinks = [
    { label: "GitHub", href: siteConfig.githubUrl },
    { label: "RSS / Podcast feed", href: podcastRssHref },
    { label: "Start with a Question", href: "/questions" },
    { label: "Reading Trails", href: "/trails" },
    { label: "What’s New", href: "/whats-new" },
    { label: "Search", href: "/search" },
    { label: "Collaborators", href: "/collaborators" },
    { label: "Explore patterns", href: "/explore/patterns" },
    { label: "Explore situations", href: "/explore/situations" },
    { label: "Explore books", href: "/explore/books" },
    { label: "Privacy & cookies", href: "/privacy" },
  ];

  const social = resolveSiteSocialLinks();

  return (
    <footer className="atm-footer border-t border-border/60 bg-bg-elevated/40">
      <span className="atm-footer-grain" aria-hidden />
      <Container className="atm-footer__inner py-6 md:py-16">
        <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:gap-12">
          <div>
            <SiteLockup variant="footer" />
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted md:mt-6">
              {siteConfig.description}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted md:text-xs">Together</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0 md:mt-4 md:block md:space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link className={footerNavLinkClass} href={link.href}>
                    {link.href === podcastRssHref ? (
                      <SiteIcon icon={RssIcon} size="sm" className="text-muted" />
                    ) : null}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-muted md:mt-8 md:text-xs">
              Elsewhere
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-0.5 md:mt-3" aria-label="Social profiles">
              <TrackedLink
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="After Certainty on GitHub"
                className={socialIconClass}
                analytics={outboundLinkAnalytics(
                  social.github,
                  "GitHub",
                  "footer_social",
                  "github",
                )}
              >
                <GitHubSymbol className="h-5 w-5" />
              </TrackedLink>
              <TrackedLink
                href={social.medium}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kevin Steffensen on Medium"
                className={socialIconClass}
                analytics={outboundLinkAnalytics(
                  social.medium,
                  "Medium",
                  "footer_social",
                  "medium",
                )}
              >
                <MediumSymbol className="h-5 w-auto" />
              </TrackedLink>
              <TrackedLink
                href={social.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kevin Steffensen on LinkedIn"
                className={socialIconClass}
                analytics={outboundLinkAnalytics(
                  social.linkedIn,
                  "LinkedIn",
                  "footer_social",
                  "linkedin",
                )}
              >
                <LinkedInSymbol className="h-5 w-5" />
              </TrackedLink>
              <TrackedLink
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="@kstefftube on YouTube"
                className={socialIconClass}
                analytics={outboundLinkAnalytics(
                  social.youtube,
                  "YouTube",
                  "footer_social",
                  "youtube",
                )}
              >
                <YouTubeSymbol className="h-5 w-5" />
              </TrackedLink>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-2 border-t border-border/30 pt-4 text-xs text-muted md:mt-12 md:space-y-3 md:border-0 md:pt-0">
          <p>
            After Certainty is an open corpus of books, concepts, patterns, questions, and reading
            paths. This site is built directly from that shared corpus.
          </p>
          <p className="uppercase tracking-[0.25em]">
            Content licensed{" "}
            <a
              className="text-accent underline-offset-4 hover:underline"
              href={siteConfig.license.url}
            >
              {siteConfig.license.name}
            </a>
            . Attribution appreciated; remix thoughtfully.
          </p>
          {manifestDate ? (
            <p className="text-[11px] normal-case tracking-normal text-muted/70">
              Semantic data: {manifestDate}
            </p>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}

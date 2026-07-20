import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { SiteLockup } from "@/components/branding/site-lockup";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { GitHubSymbol } from "@/components/icons/social/GitHubSymbol";
import { LinkedInSymbol } from "@/components/icons/social/LinkedInSymbol";
import { MediumSymbol } from "@/components/icons/social/MediumSymbol";
import { YouTubeSymbol } from "@/components/icons/social/YouTubeSymbol";
import { resolvePodcastRssUrl, resolveSiteSocialLinks, siteConfig } from "@/lib/site-config";
import { Container } from "@/components/ui/container";
import { getSemanticGraph } from "@/lib/graph/manifest";

const socialIconClass =
  "rounded-md p-2 text-muted transition-colors duration-200 ease-out hover:bg-border/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60";

export async function SiteFooter() {
  const semanticGraph = await getSemanticGraph();
  const manifestDate = semanticGraph.generatedAt
    ? new Date(semanticGraph.generatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const footerLinks = [
    { label: "GitHub", href: siteConfig.githubUrl },
    { label: "RSS / Podcast feed", href: resolvePodcastRssUrl() },
    { label: "Start with a Question", href: "/questions" },
    { label: "Reading Trails", href: "/trails" },
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
      <Container className="atm-footer__inner py-16">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
          <div>
            <SiteLockup variant="footer" />
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
              {siteConfig.description}
            </p>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted">
              Content licensed{" "}
              <a
                className="text-accent underline-offset-4 hover:underline"
                href={siteConfig.license.url}
              >
                {siteConfig.license.name}
              </a>
              . Attribution appreciated; remix thoughtfully.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">Together</p>
            <ul className="mt-4 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-sm text-fg transition-colors hover:text-accent"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted">Elsewhere</p>
            <div className="mt-3 flex flex-wrap items-center gap-0.5" aria-label="Social profiles">
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
        <p className="mt-12 text-xs text-muted">
          Built as an open commons — books ship from sibling repositories; this site aggregates
          manifests and surfaces collaboration entry points.
          {manifestDate && (
            <span className="mt-2 block text-[11px] text-muted/70">
              Semantic data: {manifestDate}
            </span>
          )}
        </p>
      </Container>
    </footer>
  );
}

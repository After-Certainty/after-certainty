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
  "flex min-h-11 max-w-full items-center gap-1.5 text-left text-sm leading-snug text-fg transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:min-h-0";

const mobileNavLinkClass =
  "inline-flex min-h-11 items-center text-sm text-fg transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const metaLinkClass =
  "text-muted underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

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

  const desktopFooterLinks = [
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

  const mobilePrimaryLinks = [
    { label: "Explore", href: "/explore/books" },
    { label: "About", href: "/about" },
    { label: "What’s New", href: "/whats-new" },
    { label: "Search", href: "/search" },
  ];

  const social = resolveSiteSocialLinks();

  return (
    <footer className="atm-footer border-t border-border/60 bg-bg-elevated/40">
      <span className="atm-footer-grain" aria-hidden />
      <Container className="atm-footer__inner py-5 md:py-16">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr] md:gap-12">
          <div>
            <SiteLockup variant="footer" />
            <p className="mt-2.5 max-w-xl text-sm leading-snug text-muted md:mt-6 md:leading-relaxed">
              {siteConfig.description}
            </p>

            <nav
              aria-label="Footer"
              className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-0 md:hidden"
              data-footer-nav="mobile"
            >
              {mobilePrimaryLinks.map((link, index) => (
                <span key={link.href} className="inline-flex items-center gap-3">
                  {index > 0 ? (
                    <span className="text-muted/50" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <Link className={mobileNavLinkClass} href={link.href}>
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>

            <div
              className="mt-2 flex flex-wrap items-center gap-0.5 md:hidden"
              aria-label="Social profiles"
              data-footer-social="mobile"
            >
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

          <div className="hidden md:block" data-footer-nav="desktop">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted md:text-xs">Together</p>
            <ul className="mt-4 space-y-3">
              {desktopFooterLinks.map((link) => (
                <li key={link.href} className="min-w-0">
                  <Link className={footerNavLinkClass} href={link.href}>
                    {link.href === podcastRssHref ? (
                      <SiteIcon icon={RssIcon} size="sm" className="shrink-0 text-muted" />
                    ) : null}
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-muted md:text-xs">
              Elsewhere
            </p>
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

        <div className="mt-4 space-y-1.5 border-t border-border/30 pt-3 text-[11px] leading-snug text-muted/80 md:mt-12 md:space-y-3 md:border-0 md:pt-0 md:text-xs md:leading-relaxed md:text-muted">
          <p>
            Open corpus · Content licensed{" "}
            <a
              className="text-accent underline-offset-4 hover:underline"
              href={siteConfig.license.url}
            >
              {siteConfig.license.name}
            </a>
            .
          </p>
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <Link className={metaLinkClass} href="/privacy">
              Privacy
            </Link>
            <span aria-hidden className="text-muted/50">
              ·
            </span>
            <a
              className={metaLinkClass}
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <span aria-hidden className="text-muted/50">
              ·
            </span>
            <a className={`inline-flex items-center gap-1.5 ${metaLinkClass}`} href={podcastRssHref}>
              <SiteIcon icon={RssIcon} size="sm" className="shrink-0" />
              RSS
            </a>
          </p>
          <p className="hidden text-xs leading-relaxed text-muted md:block">
            After Certainty is an open corpus of books, concepts, patterns, questions, and reading
            paths. This site is built directly from that shared corpus. Attribution appreciated;
            remix thoughtfully.
          </p>
          {manifestDate ? (
            <p className="normal-case tracking-normal text-muted/65">
              Semantic data: {manifestDate}
            </p>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}

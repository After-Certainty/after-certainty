import Link from "next/link";
import { SiteLockup } from "@/components/branding/site-lockup";
import { GitHubSymbol } from "@/components/books/when-others-look-to-you/icons/GitHubSymbol";
import { LinkedInSymbol } from "@/components/books/when-others-look-to-you/icons/LinkedInSymbol";
import { MediumSymbol } from "@/components/books/when-others-look-to-you/icons/MediumSymbol";
import { YouTubeSymbol } from "@/components/books/when-others-look-to-you/icons/YouTubeSymbol";
import { resolvePodcastRssUrl, resolveSiteSocialLinks, siteConfig } from "@/lib/site-config";
import { Container } from "@/components/ui/container";

const socialIconClass =
  "rounded-md p-2 text-muted transition-colors duration-200 ease-out hover:bg-border/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60";

export function SiteFooter() {
  const footerLinks = [
    { label: "GitHub", href: siteConfig.githubUrl },
    { label: "RSS / Podcast feed", href: resolvePodcastRssUrl() },
    { label: "Collaborators", href: "/collaborators" },
    { label: "Patterns library", href: "/patterns" },
  ];

  const social = resolveSiteSocialLinks();

  return (
    <footer className="atm-footer border-t border-border/60 bg-bg-elevated/40">
      <span className="atm-footer-grain" aria-hidden />
      <Container className="atm-footer__inner py-16">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
          <div>
            <SiteLockup variant="footer" />
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">{siteConfig.description}</p>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted">
              Content licensed{" "}
              <a className="text-accent underline-offset-4 hover:underline" href={siteConfig.license.url}>
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
                  <Link className="text-sm text-fg transition-colors hover:text-accent" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted">Elsewhere</p>
            <div className="mt-3 flex flex-wrap items-center gap-0.5" aria-label="Social profiles">
              <Link
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="After Certainty on GitHub"
                className={socialIconClass}
              >
                <GitHubSymbol className="h-5 w-5" />
              </Link>
              <Link
                href={social.medium}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kevin Steffensen on Medium"
                className={socialIconClass}
              >
                <MediumSymbol className="h-5 w-auto" />
              </Link>
              <Link
                href={social.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kevin Steffensen on LinkedIn"
                className={socialIconClass}
              >
                <LinkedInSymbol className="h-5 w-5" />
              </Link>
              <Link
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="@kstefftube on YouTube"
                className={socialIconClass}
              >
                <YouTubeSymbol className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-12 text-xs text-muted">
          Built as an open commons — books ship from sibling repositories; this site aggregates manifests and
          surfaces collaboration entry points.
        </p>
      </Container>
    </footer>
  );
}

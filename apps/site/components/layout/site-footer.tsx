import Link from "next/link";
import { SiteLockup } from "@/components/branding/site-lockup";
import { resolvePodcastRssUrl, siteConfig } from "@/lib/site-config";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  const footerLinks = [
    { label: "GitHub", href: siteConfig.githubUrl },
    { label: "RSS / Podcast feed", href: resolvePodcastRssUrl() },
    { label: "Collaborators", href: "/collaborators" },
    { label: "Patterns library", href: "/patterns" },
  ];

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

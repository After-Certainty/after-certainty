import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy & analytics",
  description:
    "How After Certainty uses Vercel Web Analytics and Speed Insights for aggregate measurement.",
});

export default function PrivacyPage() {
  return (
    <Section className="pb-24 pt-16">
      <Container className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Legal & preferences</p>
        <h1 className="mt-4 font-display text-4xl text-fg">Privacy & analytics</h1>

        <div className="prose prose-invert mt-10 max-w-none text-muted prose-headings:font-display prose-headings:text-fg prose-a:text-accent">
          <h2>What we collect</h2>
          <p>
            {siteConfig.name} is a mostly static site. We use first-party aggregate measurement hosted with our
            deployment platform. We do not sell your data, and we do not send manuscript text, raw search queries, or
            personal profiles in custom analytics events.
          </p>

          <h2>Vercel Web Analytics &amp; Speed Insights</h2>
          <p>
            This site uses <strong className="text-fg">Vercel Web Analytics</strong> and{" "}
            <strong className="text-fg">Speed Insights</strong> for aggregate metrics (page views, referrers, coarse
            geography and device, custom reader events such as chapter opens and on-site search buckets, and
            performance vitals). These tools are cookieless aggregate measurement; they do not use a Google Analytics
            tag or consent cookie.
          </p>
          <p>
            Custom reader events use privacy-safe properties only (for example book/chapter ids and search result-count
            buckets)—never raw search query text.
          </p>

          <h2>Google Analytics</h2>
          <p>
            We no longer load Google Analytics 4 or Google tags on this site. Historical GA reporting tooling may remain
            in the repository as legacy documentation only.
          </p>

          <h2>External search</h2>
          <p>
            Separately, Google Search Console (when configured) reports how the site appears in Google Search. That is
            operator-side search analytics, not an on-site tracking cookie.
          </p>

          <h2>Site content license</h2>
          <p>
            Commons content remains licensed{" "}
            <a href={siteConfig.license.url} className="underline-offset-4 hover:underline">
              {siteConfig.license.name}
            </a>
            . This privacy notice does not change those terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about privacy or this site: reach out via{" "}
            <a href={siteConfig.githubUrl} className="underline-offset-4 hover:underline">
              GitHub
            </a>{" "}
            discussions or the social links in the footer.
          </p>
        </div>

        <p className="mt-12">
          <Link href="/" className="text-sm text-accent underline-offset-4 hover:underline">
            ← Back home
          </Link>
        </p>
      </Container>
    </Section>
  );
}

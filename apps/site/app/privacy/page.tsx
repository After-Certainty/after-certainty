import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy & cookies",
  description:
    "How After Certainty uses cookies, Google Analytics, and Vercel Web Analytics, and how to change your preferences.",
});

export default function PrivacyPage() {
  return (
    <Section className="pb-24 pt-16">
      <Container className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Legal & preferences</p>
        <h1 className="mt-4 font-display text-4xl text-fg">Privacy & cookies</h1>

        <div className="prose prose-invert mt-10 max-w-none text-muted prose-headings:font-display prose-headings:text-fg prose-a:text-accent">
          <h2>What we collect</h2>
          <p>
            {siteConfig.name} is a mostly static site. We use two aggregate measurement tools. We do not sell your data,
            and we do not send manuscript text, raw search queries, or personal profiles in custom analytics events.
          </p>

          <h2>Google Analytics 4 (cookie choice)</h2>
          <p>
            When you accept analytics cookies, we use <strong className="text-fg">Google Analytics 4</strong> for
            aggregate traffic: pages viewed, general geography, device type, and consented custom events.{" "}
            <strong className="text-fg">GA analytics cookies and our custom GA events are off by default</strong> until
            you click &ldquo;Accept analytics&rdquo;. Until then, Google tags run in Consent Mode with{" "}
            <code>analytics_storage</code> denied — no GA analytics cookies are set, and this site does not send custom
            GA events. If you accept, Google may set cookies such as <code>_ga</code> to recognize returning browsers.
          </p>
          <p>
            On production, the Google tag may still load while storage is denied. In that state Google&apos;s Consent
            Mode can allow limited cookieless measurement pings; Reject does not uninstall the tag. Reject{" "}
            <em>does</em> keep GA cookies unset and blocks our custom GA events.
          </p>

          <h2>Vercel Web Analytics &amp; Speed Insights</h2>
          <p>
            Independently of the cookie banner, this site uses <strong className="text-fg">Vercel Web Analytics</strong>{" "}
            and <strong className="text-fg">Speed Insights</strong> — first-party aggregate metrics hosted with our
            deployment platform (page views, referrers, coarse geography/device, custom reader events, and performance
            vitals). These tools do not use the GA consent cookie; rejecting analytics on the banner does not disable
            Vercel&apos;s aggregate collection. Whether a separate notice or control is required for a Vercel-only setup
            remains under review.
          </p>

          <h2>Change or withdraw Google Analytics consent</h2>
          <p>
            To withdraw GA cookie consent and stop our custom GA events, clear site cookies for this domain in your
            browser settings, or delete the <code>ac_cookie_consent</code> cookie and reload — the banner will appear
            again so you can choose Reject. That action does not disable Vercel Web Analytics or Speed Insights, and it
            does not remove the Google tag from the page while Consent Mode remains denied.
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

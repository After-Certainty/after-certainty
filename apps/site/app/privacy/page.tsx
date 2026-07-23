import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy & cookies",
  description: "How After Certainty uses cookies and Google Analytics, and how to change your preferences.",
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
            {siteConfig.name} is a mostly static site. When you accept analytics cookies, we use{" "}
            <strong className="text-fg">Google Analytics 4</strong> to understand aggregate traffic: pages viewed, general
            geography, device type, and similar usage patterns. We do not sell your data.
          </p>

          <h2>Analytics cookies</h2>
          <p>
            Analytics is <strong className="text-fg">off by default</strong>. Until you click &ldquo;Accept
            analytics&rdquo; on the cookie banner, Google tags run in Consent Mode with storage denied — no analytics
            cookies are set. If you accept, Google may set cookies such as <code>_ga</code> to recognize returning
            browsers.
          </p>

          <h2>Change or withdraw consent</h2>
          <p>
            To stop analytics tracking, clear site cookies for this domain in your browser settings, or delete the{" "}
            <code>ac_cookie_consent</code> cookie and reload — the banner will appear again so you can choose Reject.
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

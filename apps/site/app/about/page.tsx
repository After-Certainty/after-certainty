import type { Metadata } from "next";
import { AboutAuthor } from "@/components/about/about-author";
import { AboutClosingQuote } from "@/components/about/about-closing-quote";
import { AboutHero } from "@/components/about/about-hero";
import { AboutPublishing } from "@/components/about/about-publishing";
import { AboutStructure } from "@/components/about/about-structure";
import { AboutVision } from "@/components/about/about-vision";
import { AboutWhy } from "@/components/about/about-why";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/site-config";
import { createPageMetadata } from "@/lib/metadata";
import { buildAboutPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description: `${siteConfig.name}—why the project exists, how it is published, and the orientation behind the work. A reflective introduction, not a pitch.`,
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={buildAboutPageJsonLd()} />
      <AboutHero />
      <AboutWhy />
      <AboutStructure />
      <AboutPublishing />
      <AboutAuthor />
      <AboutVision />
      <AboutClosingQuote />
    </>
  );
}

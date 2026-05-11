import type { Metadata } from "next";
import { PatternsClosingQuote } from "@/components/patterns/patterns-closing-quote";
import { PatternsExplorerClient } from "@/components/patterns/patterns-explorer-client";
import { PatternsHero } from "@/components/patterns/patterns-hero";
import { PatternsIntroSection } from "@/components/patterns/patterns-intro-section";
import { PatternsOpenLibrarySection } from "@/components/patterns/patterns-open-library-section";
import { PatternsRelationshipsSection } from "@/components/patterns/patterns-relationships-section";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getAllPatternThemes, getLibraryPatterns, getPatternBookSections } from "@/lib/patterns/registry";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Patterns",
  description:
    "Recurring structures across leadership, meaning, trust, and systems — an open pattern library for reflective exploration.",
});

export default function PatternsPage() {
  const sectionsTemplate = getPatternBookSections();
  const patterns = getLibraryPatterns();
  const themeOptions = getAllPatternThemes(patterns);

  return (
    <article>
      <PatternsHero />
      <PatternsIntroSection />

      <Section atmosphere="none" className="border-b border-border/35 py-16 md:py-20">
        <Container>
          <p className="text-xs uppercase tracking-[0.32em] text-muted">Explorer</p>
          <h2 className="mt-5 font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            Browse by book
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">
            Filter by shelf or theme, search across observations, and open a pattern for a calmer, typography-first
            reading—without leaving the atmosphere of the site.
          </p>
          <div className="mt-14">
            <PatternsExplorerClient
              sectionsTemplate={sectionsTemplate}
              patterns={patterns}
              themeOptions={themeOptions}
            />
          </div>
        </Container>
      </Section>

      <PatternsRelationshipsSection />
      <PatternsOpenLibrarySection />
      <PatternsClosingQuote />
    </article>
  );
}

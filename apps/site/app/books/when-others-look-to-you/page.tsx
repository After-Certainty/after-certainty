import type { Metadata } from "next";
import { Hero } from "@/components/books/when-others-look-to-you/sections/Hero";
import { PatternSection } from "@/components/books/when-others-look-to-you/sections/PatternSection";
import { RenewalErosionSection } from "@/components/books/when-others-look-to-you/sections/RenewalErosionSection";
import { WhyItMattersSection } from "@/components/books/when-others-look-to-you/sections/WhyItMattersSection";
import { buildHomeMetadata } from "@/lib/books/when-others-look-to-you/metadata";
import {
  heroContent,
  patternSectionContent,
  sectionContent,
} from "@/lib/books/when-others-look-to-you/content";

export async function generateMetadata(): Promise<Metadata> {
  return buildHomeMetadata();
}

export default function WhenOthersLookToYouHome() {
  const { renewalErosion, whyItMatters } = sectionContent;

  return (
    <>
      <Hero {...heroContent} />
      <PatternSection {...patternSectionContent} />
      <RenewalErosionSection {...renewalErosion} />
      <WhyItMattersSection {...whyItMatters} />
    </>
  );
}

import { Hero } from "@/components/home/hero";
import { FeaturedQuestionsSection } from "@/components/questions/featured-questions-section";
import { PatternRecognitionFeature } from "@/components/home/pattern-recognition-feature";
import { WhyProjectExistsSection } from "@/components/home/why-project-exists-section";
import { FeaturedTrailsSection } from "@/components/trails/featured-trails-section";
import { PathwayGrid } from "@/components/home/pathway-grid";
import { MissionRecentSection } from "@/components/home/mission-recent-section";
import { JsonLd } from "@/components/seo/json-ld";
import { buildHomePageJsonLd } from "@/lib/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHomePageJsonLd()} />
      <Hero />
      <FeaturedQuestionsSection />
      <PatternRecognitionFeature />
      <WhyProjectExistsSection />
      <PathwayGrid />
      <FeaturedTrailsSection />
      <MissionRecentSection />
    </>
  );
}

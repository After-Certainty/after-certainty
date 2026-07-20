import { Hero } from "@/components/home/hero";
import { FeaturedQuestionsSection } from "@/components/questions/featured-questions-section";
import { FeaturedTrailsSection } from "@/components/trails/featured-trails-section";
import { MissionRecentSection } from "@/components/home/mission-recent-section";
import { PathwayGrid } from "@/components/home/pathway-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { buildHomePageJsonLd } from "@/lib/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHomePageJsonLd()} />
      <Hero />
      <FeaturedQuestionsSection />
      <FeaturedTrailsSection />
      <PathwayGrid />
      <MissionRecentSection />
    </>
  );
}

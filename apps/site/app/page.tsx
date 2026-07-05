import { Hero } from "@/components/home/hero";
import { MissionRecentSection } from "@/components/home/mission-recent-section";
import { PathwayGrid } from "@/components/home/pathway-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { buildHomePageJsonLd } from "@/lib/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHomePageJsonLd()} />
      <Hero />
      <PathwayGrid />
      <MissionRecentSection />
    </>
  );
}

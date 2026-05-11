import { Hero } from "@/components/home/hero";
import { MissionRecentSection } from "@/components/home/mission-recent-section";
import { PathwayGrid } from "@/components/home/pathway-grid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PathwayGrid />
      <MissionRecentSection />
    </>
  );
}

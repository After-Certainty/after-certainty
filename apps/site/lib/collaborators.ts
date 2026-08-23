import contributorsData from "@/data/contributors.json";
import type { Contributor } from "@/types/content";

export function getContributors(): Contributor[] {
  return contributorsData.contributors as Contributor[];
}

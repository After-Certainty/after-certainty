import type { ReactNode } from "react";
import { ExploreLayout } from "@/components/explore/explore-layout";

export default function ExploreBrowseLayout({ children }: { children: ReactNode }) {
  return <ExploreLayout>{children}</ExploreLayout>;
}

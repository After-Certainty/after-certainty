import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { ExploreSidebar } from "@/components/explore/explore-sidebar";

type ExploreLayoutProps = {
  children: ReactNode;
  /** Hide the subtle section wayfinding strip (e.g. on the explore landing). */
  hideSidebar?: boolean;
};

/**
 * Atmospheric shell for the semantic atlas — spacious, minimal chrome.
 * Future: graph overlays / topology maps can extend this wrapper without changing routes.
 */
export function ExploreLayout({ children, hideSidebar = false }: ExploreLayoutProps) {
  return (
    <div className="relative overflow-x-clip border-b border-border/30 bg-gradient-to-b from-bg-elevated/40 via-transparent to-transparent pb-4 pt-0 md:pb-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--glow),transparent)] opacity-90" aria-hidden />
      <Container className="relative">
        {!hideSidebar ? <ExploreSidebar /> : null}
        {children}
      </Container>
    </div>
  );
}

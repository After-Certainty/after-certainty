import type { ReactNode } from "react";

/**
 * Dedicated reader layout — no Explore sidebar, Container, or browse gradient.
 * Site header/footer are omitted via ReaderAwareHeader / ReaderAwareFooter in SiteShell.
 */
export default function ExploreReaderLayout({ children }: { children: ReactNode }) {
  return (
    <div data-reader-layout="" className="relative min-h-[100dvh] bg-bg">
      {children}
    </div>
  );
}

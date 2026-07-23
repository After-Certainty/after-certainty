import type { ReactNode } from "react";

/** Thin parent: list/detail pages use `(browse)/layout` with ExploreLayout; `/explore` observatory is full-bleed. */
export default function ExploreRootLayout({ children }: { children: ReactNode }) {
  return children;
}

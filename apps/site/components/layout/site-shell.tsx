import type { ReactNode } from "react";
import { ReaderAwareFooter } from "@/components/layout/reader-aware-footer";
import { SkipLink } from "@/components/layout/skip-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ReaderAwareFooter>
        <SiteFooter />
      </ReaderAwareFooter>
    </>
  );
}

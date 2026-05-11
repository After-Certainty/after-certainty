import type { ReactNode } from "react";
import { Header } from "@/components/books/when-others-look-to-you/layout/Header";
import { fontBody, fontHeading } from "@/lib/books/when-others-look-to-you/fonts";
import { site, woltyBasePath } from "@/lib/books/when-others-look-to-you/content";

export default function WhenOthersLookToYouLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`wolty-book-root scroll-pt-20 ${fontHeading.variable} ${fontBody.variable} ${fontBody.className} flex min-h-0 flex-1 flex-col bg-brand-navy text-zinc-200 antialiased`}
    >
      <Header
        homeHref={woltyBasePath}
        title={site.headerTitle}
        nav={site.nav}
        cta={site.headerCta}
      />
      <div className="relative min-h-0 min-w-0 flex-1 overflow-x-clip">{children}</div>
    </div>
  );
}

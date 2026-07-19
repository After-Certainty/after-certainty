import Link from "next/link";
import { SiteLockup } from "@/components/branding/site-lockup";
import { MobileNav } from "@/components/layout/mobile-nav";
import { HeaderSearchButton } from "@/components/search/header-search-button";
import { SearchPaletteProvider } from "@/components/search/search-palette-provider";
import { siteConfig } from "@/lib/site-config";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <SearchPaletteProvider>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6 md:gap-6">
          <SiteLockup variant="header" />
          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs uppercase tracking-[0.22em] text-muted transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderSearchButton />
            <ThemeToggle />
            <MobileNav items={siteConfig.navigation} />
            <Link
              href="/start"
              className="hidden rounded-sm border border-border/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/50 sm:inline-flex"
            >
              Start
            </Link>
          </div>
        </div>
      </header>
    </SearchPaletteProvider>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

import { SiteLockup } from "@/components/branding/site-lockup";
import { MobileNav } from "@/components/layout/mobile-nav";
import { HeaderSearchButton } from "@/components/search/header-search-button";
import { SearchPaletteProvider } from "@/components/search/search-palette-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMobileScrollHide } from "@/hooks/use-mobile-scroll-hide";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { hidden } = useMobileScrollHide({ forceVisible: menuOpen });

  return (
    <SearchPaletteProvider>
      <header
        className={[
          "sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-md",
          "transition-transform duration-200 ease-out will-change-transform md:translate-y-0",
          "motion-reduce:transition-none motion-reduce:translate-y-0",
          hidden ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
        data-header-scroll-hidden={hidden ? "true" : "false"}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1.75rem,env(safe-area-inset-right,0px))] md:gap-6 md:px-6">
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
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <HeaderSearchButton />
            <ThemeToggle />
            <MobileNav items={siteConfig.navigation} onOpenChange={setMenuOpen} />
            <Link
              href="/start"
              className="hidden rounded-sm border border-border/70 px-3 py-2 text-xs uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/50 md:inline-flex"
            >
              Start
            </Link>
          </div>
        </div>
      </header>
    </SearchPaletteProvider>
  );
}

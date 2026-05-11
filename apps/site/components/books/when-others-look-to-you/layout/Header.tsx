"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/books/when-others-look-to-you/ui/Button";
import { cn } from "@/lib/books/when-others-look-to-you/cn";

export type HeaderNavItem = {
  label: string;
  href: string;
};

type HeaderProps = {
  /** Book microsite home (defaults to site root for standalone builds). */
  homeHref?: string;
  title: string;
  nav: readonly HeaderNavItem[];
  cta: { label: string; href: string };
};

const navLinkClass =
  "rounded-md px-3 py-2 text-sm text-white/85 transition-all duration-300 ease-out hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold";

const drawerLinkClass =
  "block rounded-lg px-4 py-3.5 text-base font-medium text-white/90 transition-all duration-300 ease-out hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold";

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-6 flex-col justify-center gap-1.5" aria-hidden>
      <span
        className={cn(
          "block h-0.5 w-full rounded-full bg-white transition-all duration-300 ease-out",
          open && "translate-y-[7px] rotate-45",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-full rounded-full bg-white transition-all duration-300 ease-out",
          open && "scale-x-0 opacity-0",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-full rounded-full bg-white transition-all duration-300 ease-out",
          open && "-translate-y-[7px] -rotate-45",
        )}
      />
    </span>
  );
}

export function Header({ homeHref = "/", title, nav, cta }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 border-b border-white/10 bg-brand-navy/92 backdrop-blur-md supports-[backdrop-filter]:bg-brand-navy/88",
          menuOpen ? "z-[70]" : "z-50",
        )}
      >
        <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-[var(--padding-inline-section)] sm:h-16 sm:gap-4">
          <Link
            href={homeHref}
            aria-label="Home"
            className={cn(
              "min-w-0 max-w-[min(100%,14rem)] shrink-0 font-[family-name:var(--font-heading)] text-[0.65rem] font-semibold uppercase leading-tight tracking-[0.2em] text-white antialiased transition-opacity duration-300 ease-out hover:opacity-90 sm:max-w-[min(100%,18rem)] sm:text-[0.7rem] md:max-w-none md:text-xs",
            )}
          >
            <span className="block break-words">{title}</span>
          </Link>

          <nav
            className="hidden items-center md:flex md:flex-1 md:justify-center md:gap-6 lg:gap-8"
            aria-label="Primary"
          >
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 md:block">
            <Button
              href={cta.href}
              className="px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm"
            >
              {cta.label}
            </Button>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white transition-all duration-300 ease-out",
              "hover:border-white/25 hover:bg-white/[0.1]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold",
              "md:hidden",
            )}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {/* Mobile drawer — right panel ~80% */}
      <div
        className={cn(
          "fixed inset-0 z-[60] md:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeMenu}
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-[opacity,backdrop-filter] duration-300 ease-in-out supports-[backdrop-filter]:bg-black/40",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
        />

        <aside
          id="mobile-nav"
          className={cn(
            "absolute right-0 top-0 flex h-full w-[min(80%,20rem)] flex-col border-l border-white/10 bg-brand-navy/98 shadow-[-12px_0_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] supports-[backdrop-filter]:bg-brand-navy/95",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-6 pt-20">
            <nav className="flex flex-col gap-1" aria-label="Mobile primary">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={drawerLinkClass}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-white/10 p-4">
            <Button
              href={cta.href}
              className="w-full justify-center py-3 text-sm font-semibold transition-all duration-300 ease-out"
              onClick={closeMenu}
            >
              {cta.label}
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
